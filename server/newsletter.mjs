import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { contentEmailHtml, contentPlainText } from '../shared/newsletter-content.mjs';

const site = 'https://bcncountryfest.com';
const origins = new Set([site, 'https://www.bcncountryfest.com', 'https://barcelonacountry.com', 'https://www.barcelonacountry.com']);
const languages = ['es', 'ca', 'en', 'fr', 'it', 'de'];
const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

export function unsubscribeToken(id, secret) {
  return `${id}.${createHmac('sha256', secret).update(`unsubscribe:${id}`).digest('hex')}`;
}
export function verifyUnsubscribe(token, secret) {
  if (typeof token !== 'string' || !/^[0-9a-f-]{36}\.[0-9a-f]{64}$/.test(token) || !secret) return null;
  const id = token.split('.')[0];
  const expected = unsubscribeToken(id, secret);
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected)) ? id : null;
}

const emailCopy = {
  es: ['Bienvenido a Barcelona Country News', 'Gracias por suscribirte. Aquí tienes nuestro primer número.', 'Leer el número completo', 'Visitar el blog', 'Darme de baja'],
  ca: ['Benvingut a Barcelona Country News', "Gràcies per subscriure-t’hi. Aquí tens el nostre primer número.", 'Llegeix el número complet', 'Visita el blog', 'Dona’m de baixa'],
  en: ['Welcome to Barcelona Country News', 'Thanks for subscribing. Here is our first issue.', 'Read the full issue', 'Visit the blog', 'Unsubscribe'],
  fr: ['Bienvenue à Barcelona Country News', 'Merci de votre inscription. Voici notre premier numéro.', 'Lire le numéro complet', 'Visiter le blog', 'Me désinscrire'],
  it: ['Benvenuto su Barcelona Country News', 'Grazie per esserti iscritto. Ecco il nostro primo numero.', 'Leggi il numero completo', 'Visita il blog', 'Annulla iscrizione'],
  de: ['Willkommen bei Barcelona Country News', 'Danke für dein Abonnement. Hier ist unsere erste Ausgabe.', 'Die ganze Ausgabe lesen', 'Zum Blog', 'Abmelden']
};

export function welcomeEmail(registration, issue, secret, from) {
  const t = emailCopy[registration.subscription_locale] ?? emailCopy.es;
  const issueUrl = `${site}/newsletters/${encodeURIComponent(issue.slug)}`;
  const token = unsubscribeToken(registration.id, secret);
  const unsubscribeUrl = `${site}/baja?token=${token}`;
  const content = contentEmailHtml(issue.content);
  return {
    from: `Barcelona Country News <${from}>`, to: [registration.email], subject: `${t[0]} · Nº 1`,
    headers: { 'List-Unsubscribe': `<${site}/api/newsletter?action=unsubscribe&token=${token}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
    text: `${t[0]}\n${registration.full_name}\n\n${t[1]}\n\n${issue.title}\n${contentPlainText(issue.content)}\n\n${t[2]}: ${issueUrl}\n${t[3]}: ${site}/newsletters\n${t[4]}: ${unsubscribeUrl}`,
    html: `<!doctype html><html><body style="margin:0;background:#151515;padding:24px 12px;font-family:Arial,sans-serif"><div style="max-width:640px;margin:auto;background:#f4efe5;color:#201d19"><div style="background:#101010;padding:30px;border-bottom:5px solid #c40000"><img src="${site}/assets/brand-logo.png" width="200" style="display:block;width:200px;max-width:100%;height:auto" alt="Barcelona Country Festival"><p style="color:#fff;font-size:28px;font-weight:bold;margin-bottom:0">Barcelona Country <span style="color:#ff4949">News</span></p></div><div style="padding:32px;line-height:1.75"><p>${escapeHtml(registration.full_name)},</p><p>${t[1]}</p><p style="color:#a40000;font-weight:bold">Nº 01</p><h1 style="font:700 34px/1.15 Georgia,serif">${escapeHtml(issue.title)}</h1>${content}<p><a style="display:inline-block;padding:13px 22px;background:#c40000;color:#fff;text-decoration:none" href="${issueUrl}">${t[2]} →</a></p><p><a style="color:#a40000" href="${site}/newsletters">${t[3]}</a></p><hr style="border:0;border-top:1px solid #ccc"><p style="font-size:12px">Barcelona Country Fest · 22–24 OCT 2027 · Fira Cornellà<br><a href="${unsubscribeUrl}" style="color:#555">${t[4]}</a></p></div></div></body></html>`
  };
}

export function createNewsletterHandler({ env = process.env, clientFactory = createClient, sendFetch = fetch } = {}) {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const publicKey = env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const secretKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const signingSecret = env.NEWSLETTER_SIGNING_SECRET || secretKey;
  const mailReady = Boolean(env.RESEND_API_KEY && env.NEWSLETTER_FROM_EMAIL && secretKey && signingSecret);
  const options = { auth: { autoRefreshToken: false, persistSession: false } };
  const db = url && (secretKey || publicKey) ? clientFactory(url, secretKey || publicKey, options) : null;

  async function sendWelcome(registration, issue) {
    if (!registration.newsletter_consent || registration.welcome_newsletter_sent_at) return 'skipped';
    try {
      const response = await sendFetch('https://api.resend.com/emails', {
        method: 'POST', signal: AbortSignal.timeout(12000),
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `welcome-v1-${registration.id}` },
        body: JSON.stringify(welcomeEmail(registration, issue, signingSecret, env.NEWSLETTER_FROM_EMAIL))
      });
      if (!response.ok) return 'pending';
      const receipt = await response.json();
      if (!receipt.id) return 'pending';
      const { error } = await db.from('registrations').update({ welcome_newsletter_sent_at: new Date().toISOString() }).eq('id', registration.id);
      return error ? 'pending' : 'sent';
    } catch { return 'pending'; }
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

      if (body.action === 'status' || body.action === 'dispatch') {
        const token = request.headers.get('authorization')?.replace(/^Bearer /, '');
        if (!token) return json({ error: 'unauthorized' }, 401);
        const { data: auth, error: authError } = await db.auth.getUser(token);
        if (authError || !auth?.user) return json({ error: 'unauthorized' }, 401);
        // Use the user's JWT for authorization even when the service key is absent.
        const userDb = clientFactory(url, publicKey || secretKey, { ...options, global: { headers: { Authorization: `Bearer ${token}` } } });
        const { data: admin } = await userDb.from('admin_users').select('user_id').eq('user_id', auth.user.id).maybeSingle();
        if (!admin) return json({ error: 'forbidden' }, 403);
        const { data: issue, error: issueError } = await userDb.from('newsletter_issues').select('*').eq('issue_number', 1).eq('is_published', true).maybeSingle();
        if (issueError) return json({ error: 'issues_unavailable' }, 500);
        const { count, error: pendingError } = await userDb.from('registrations').select('id', { count: 'exact', head: true }).eq('newsletter_consent', true).is('welcome_newsletter_sent_at', null);
        if (pendingError) return json({ error: 'registrations_unavailable' }, 500);
        if (body.action === 'status') return json({ configured: mailReady, issue_one_published: Boolean(issue), pending: count ?? 0 });
        if (!mailReady || !issue) return json({ error: !mailReady ? 'email_not_configured' : 'issue_one_not_published' }, 409);
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

      if (body.action !== 'subscribe') return json({ error: 'invalid_action' }, 400);
      if (body.website) return json({ ok: true, welcome_email: 'pending' }, 201);
      const trim = key => typeof body[key] === 'string' ? body[key].trim() : '';
      const fullName = trim('full_name'); const phone = trim('phone'); const email = trim('email').toLowerCase(); const danceLocation = trim('dance_location');
      if (body.consent !== true || body.privacy_accepted !== true || !fullName || fullName.length > 160 || !/^\+?[\d\s().-]{5,40}$/.test(phone) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320 || !danceLocation || danceLocation.length > 180) return json({ error: 'invalid_fields' }, 400);
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
