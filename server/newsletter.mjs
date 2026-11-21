import { createHmac, createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { CONTACT_EMAIL, SITE, escapeHtml, issueEmail } from './email-templates.mjs';

export { escapeHtml };
const site = SITE;
const origins = new Set(['https://bcncountryfest.com', 'https://www.bcncountryfest.com', 'https://barcelonacountry.com', 'https://www.barcelonacountry.com']);
const languages = ['es', 'ca', 'en', 'fr', 'it', 'de'];
const BATCH = 100; // Resend batch limit per request
const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const validEmail = (value) => typeof value === 'string' && value.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function unsubscribeToken(id, secret) {
  return `${id}.${createHmac('sha256', secret).update(`unsubscribe:${id}`).digest('hex')}`;
}
export function verifyUnsubscribe(token, secret) {
  if (typeof token !== 'string' || !/^[0-9a-f-]{36}\.[0-9a-f]{64}$/.test(token) || !secret) return null;
  const id = token.split('.')[0];
  const expected = unsubscribeToken(id, secret);
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected)) ? id : null;
}

// One email for one subscriber: content, signed unsubscribe link and the one-click unsubscribe headers.
function personalEmail(registration, issue, secret, from, { welcome = false, subjectPrefix = '' } = {}) {
  const token = unsubscribeToken(registration.id, secret);
  const unsubscribeUrl = `${site}/baja?token=${token}`;
  const mail = issueEmail({ issue, name: registration.full_name, lang: registration.subscription_locale, unsubscribeUrl, welcome });
  return {
    from: `Barcelona Country Festival <${from}>`, reply_to: CONTACT_EMAIL, to: [registration.email], subject: subjectPrefix + mail.subject,
    headers: { 'List-Unsubscribe': `<${site}/api/newsletter?action=unsubscribe&token=${token}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
    html: mail.html, text: mail.text,
  };
}
export const welcomeEmail = (registration, issue, secret, from) => personalEmail(registration, issue, secret, from, { welcome: true });

export function createNewsletterHandler({ env = process.env, clientFactory = createClient, sendFetch = fetch } = {}) {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const publicKey = env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const secretKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const signingSecret = env.NEWSLETTER_SIGNING_SECRET || secretKey;
  const from = env.NEWSLETTER_FROM_EMAIL;
  const mailReady = Boolean(env.RESEND_API_KEY && from && secretKey && signingSecret);
  const options = { auth: { autoRefreshToken: false, persistSession: false } };
  const db = url && (secretKey || publicKey) ? clientFactory(url, secretKey || publicKey, options) : null;
  const resend = (path, body, idempotencyKey) => sendFetch(`https://api.resend.com${path}`, {
    method: 'POST', signal: AbortSignal.timeout(20000),
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}) },
    body: JSON.stringify(body),
  });

  async function sendWelcome(registration, issue) {
    if (!registration.newsletter_consent || registration.welcome_newsletter_sent_at) return 'skipped';
    try {
      const response = await resend('/emails', welcomeEmail(registration, issue, signingSecret, from), `welcome-v1-${registration.id}`);
      if (!response.ok) return 'pending';
      const receipt = await response.json();
      if (!receipt.id) return 'pending';
      const { error } = await db.from('registrations').update({ welcome_newsletter_sent_at: new Date().toISOString() }).eq('id', registration.id);
      return error ? 'pending' : 'sent';
    } catch { return 'pending'; }
  }

  // Admin check: a valid Supabase session whose user is in admin_users. Returns a client acting as that user.
  async function adminDb(request) {
    const token = request.headers.get('authorization')?.replace(/^Bearer /, '');
    if (!token) return { error: json({ error: 'unauthorized' }, 401) };
    const { data: auth, error: authError } = await db.auth.getUser(token);
    if (authError || !auth?.user) return { error: json({ error: 'unauthorized' }, 401) };
    const userDb = clientFactory(url, publicKey || secretKey, { ...options, global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: admin } = await userDb.from('admin_users').select('user_id').eq('user_id', auth.user.id).maybeSingle();
    if (!admin) return { error: json({ error: 'forbidden' }, 403) };
    return { userDb };
  }

  return async request => {
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
    const requestUrl = new URL(request.url);
    const origin = request.headers.get('origin');
    const local = env.NODE_ENV !== 'production' && origin && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
    if (origin && !origins.has(origin) && !local && origin !== requestUrl.origin) return json({ error: 'forbidden_origin' }, 403);
    try {
      const raw = await request.text();
      if (raw.length > 8192) return json({ error: 'payload_too_large' }, 413);
      const oneClick = requestUrl.searchParams.get('action') === 'unsubscribe';
      let body;
      try { body = oneClick ? { action: 'unsubscribe', token: requestUrl.searchParams.get('token') } : JSON.parse(raw); }
      catch { return json({ error: 'invalid_json' }, 400); }
      if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'invalid_payload' }, 400);
      if (!db) return json({ error: 'database_not_configured' }, 503);

      if (body.action === 'unsubscribe') {
        const id = verifyUnsubscribe(body.token, signingSecret);
        if (!id || !secretKey) return json({ error: 'invalid_token' }, 400);
        const { error } = await db.from('registrations').update({ newsletter_consent: false }).eq('id', id);
        return error ? json({ error: 'unsubscribe_failed' }, 500) : json({ ok: true });
      }

      if (['status', 'dispatch', 'test', 'broadcast'].includes(body.action)) {
        const { userDb, error: denied } = await adminDb(request);
        if (denied) return denied;

        if (body.action === 'status') {
          const { data: issue, error: issueError } = await userDb.from('newsletter_issues').select('id').eq('issue_number', 1).eq('is_published', true).maybeSingle();
          if (issueError) return json({ error: 'issues_unavailable' }, 500);
          const { count, error: pendingError } = await userDb.from('registrations').select('id', { count: 'exact', head: true }).eq('newsletter_consent', true).is('welcome_newsletter_sent_at', null);
          if (pendingError) return json({ error: 'registrations_unavailable' }, 500);
          const { count: subscribers } = await userDb.from('registrations').select('id', { count: 'exact', head: true }).eq('newsletter_consent', true);
          const { data: deliveries } = await userDb.from('newsletter_deliveries').select('issue_id');
          const sentByIssue = {};
          for (const d of deliveries ?? []) sentByIssue[d.issue_id] = (sentByIssue[d.issue_id] ?? 0) + 1;
          return json({ configured: mailReady, from: from ?? null, issue_one_published: Boolean(issue), pending: count ?? 0, subscribers: subscribers ?? 0, sent_by_issue: sentByIssue });
        }

        if (body.action === 'dispatch') {
          const { data: issue, error: issueError } = await userDb.from('newsletter_issues').select('*').eq('issue_number', 1).eq('is_published', true).maybeSingle();
          if (issueError) return json({ error: 'issues_unavailable' }, 500);
          if (!mailReady || !issue) return json({ error: !mailReady ? 'email_not_configured' : 'issue_one_not_published' }, 409);
          const { count } = await userDb.from('registrations').select('id', { count: 'exact', head: true }).eq('newsletter_consent', true).is('welcome_newsletter_sent_at', null);
          const { data: pending, error } = await db.from('registrations').select('*').eq('newsletter_consent', true).is('welcome_newsletter_sent_at', null).order('created_at').limit(10);
          if (error) return json({ error: 'registrations_unavailable' }, 500);
          let sent = 0;
          for (const row of pending ?? []) {
            // Recheck consent immediately before sending, including manual retries.
            const { data: current } = await db.from('registrations').select('*').eq('id', row.id).maybeSingle();
            if (current && await sendWelcome(current, issue) === 'sent') sent++;
          }
          return json({ sent, pending: Math.max(0, (count ?? 0) - sent) });
        }

        // test + broadcast need a specific issue, read through the admin's own session
        if (typeof body.issue_id !== 'string') return json({ error: 'invalid_issue' }, 400);
        const { data: issue } = await userDb.from('newsletter_issues').select('*').eq('id', body.issue_id).maybeSingle();
        if (!issue) return json({ error: 'issue_not_found' }, 404);
        if (!mailReady) return json({ error: 'email_not_configured' }, 409);

        if (body.action === 'test') {
          const to = typeof body.to === 'string' ? body.to.trim().toLowerCase() : '';
          if (!validEmail(to)) return json({ error: 'invalid_email' }, 400);
          const sample = { id: '00000000-0000-4000-8000-000000000000', full_name: typeof body.name === 'string' ? body.name.slice(0, 80) : '', email: to, subscription_locale: languages.includes(body.locale) ? body.locale : 'es' };
          const response = await resend('/emails', personalEmail(sample, issue, signingSecret, from, { subjectPrefix: '[PRUEBA] ' }));
          if (!response.ok) return json({ error: 'send_failed', detail: (await response.text()).slice(0, 300) }, 502);
          return json({ ok: true, id: (await response.json()).id ?? null });
        }

        // broadcast: the published issue to every consenting subscriber who has not received it yet, 100 per call
        if (!issue.is_published) return json({ error: 'issue_not_published' }, 409);
        const { data: done, error: doneError } = await db.from('newsletter_deliveries').select('registration_id').eq('issue_id', issue.id);
        if (doneError) return json({ error: 'deliveries_unavailable' }, 500);
        const already = new Set((done ?? []).map((d) => d.registration_id));
        const { data: subscribers, error: subError } = await db.from('registrations').select('*').eq('newsletter_consent', true).order('created_at');
        if (subError) return json({ error: 'registrations_unavailable' }, 500);
        const todo = (subscribers ?? []).filter((r) => !already.has(r.id));
        const batch = todo.slice(0, BATCH);
        if (!batch.length) return json({ sent: 0, remaining: 0, total: already.size });
        const key = 'issue-' + issue.id + '-' + createHash('sha256').update(batch.map((r) => r.id).join(',')).digest('hex').slice(0, 32);
        const response = await resend('/emails/batch', batch.map((r) => personalEmail(r, issue, signingSecret, from)), key);
        if (!response.ok) return json({ error: 'send_failed', detail: (await response.text()).slice(0, 300) }, 502);
        const receipt = await response.json();
        const ids = Array.isArray(receipt.data) ? receipt.data : [];
        const rows = batch.map((r, i) => ({ issue_id: issue.id, registration_id: r.id, provider_id: ids[i]?.id ?? null }));
        const { error: logError } = await db.from('newsletter_deliveries').upsert(rows, { onConflict: 'issue_id,registration_id', ignoreDuplicates: true });
        if (logError) return json({ error: 'deliveries_not_recorded', sent: batch.length }, 500);
        return json({ sent: batch.length, remaining: todo.length - batch.length, total: already.size + batch.length });
      }

      if (body.action !== 'subscribe') return json({ error: 'invalid_action' }, 400);
      if (body.website) return json({ ok: true, welcome_email: 'pending' }, 201);
      const trim = key => typeof body[key] === 'string' ? body[key].trim() : '';
      const fullName = trim('full_name'); const phone = trim('phone'); const email = trim('email').toLowerCase(); const danceLocation = trim('dance_location');
      if (body.consent !== true || body.privacy_accepted !== true || !fullName || fullName.length > 160 || !/^\+?[\d\s().-]{5,40}$/.test(phone) || !validEmail(email) || !danceLocation || danceLocation.length > 180) return json({ error: 'invalid_fields' }, 400);
      const registration = { id: randomUUID(), full_name: fullName, email, phone, country_iso: /^[A-Z]{2}$/.test(trim('country_iso')) ? trim('country_iso') : null, dance_location: danceLocation, newsletter_consent: body.consent, privacy_accepted_at: new Date().toISOString(), subscription_locale: languages.includes(body.locale) ? body.locale : 'es' };
      const { error } = await db.from('registrations').insert(registration);
      if (error) return json({ error: error.code === '23505' ? 'duplicate' : 'registration_failed' }, error.code === '23505' ? 409 : 500);
      if (!mailReady) return json({ ok: true, welcome_email: 'pending' }, 201);
      // After persistence, delivery failures must never turn a successful signup into an error.
      let delivery = 'pending';
      try {
        const { data: issue } = await db.from('newsletter_issues').select('*').eq('issue_number', 1).eq('is_published', true).maybeSingle();
        if (issue) delivery = await sendWelcome(registration, issue);
      } catch { /* Pending deliveries remain visible to the administrator. */ }
      return json({ ok: true, welcome_email: delivery }, 201);
    } catch {
      return json({ error: 'service_unavailable' }, 500);
    }
  };
}
