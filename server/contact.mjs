import { createClient } from '@supabase/supabase-js';
import { CONTACT_EMAIL, contactNoticeEmail, contactReplyEmail, pickLang } from './email-templates.mjs';

// Contact form: store the message, notify info@ (Reply-To = sender) and send the sender an auto-reply.
// The message is saved first, so a mail-provider outage never loses it.
const origins = new Set(['https://bcncountryfest.com', 'https://www.bcncountryfest.com', 'https://barcelonacountry.com', 'https://www.barcelonacountry.com']);
const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const PER_EMAIL_WINDOW_MIN = 10, PER_EMAIL_LIMIT = 3, AUTOREPLY_PER_HOUR = 40;

export function createContactHandler({ env = process.env, clientFactory = createClient, sendFetch = fetch, now = () => new Date() } = {}) {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const secretKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const from = env.NEWSLETTER_FROM_EMAIL;
  const inbox = env.CONTACT_TO_EMAIL || CONTACT_EMAIL;
  const mailReady = Boolean(env.RESEND_API_KEY && from);
  const db = url && secretKey ? clientFactory(url, secretKey, { auth: { autoRefreshToken: false, persistSession: false } }) : null;
  const send = (mail) => sendFetch('https://api.resend.com/emails', {
    method: 'POST', signal: AbortSignal.timeout(12000),
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(mail),
  }).then((r) => r.ok).catch(() => false);

  return async (request) => {
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
    const origin = request.headers.get('origin');
    const local = env.NODE_ENV !== 'production' && origin && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
    if (origin && !origins.has(origin) && !local && origin !== new URL(request.url).origin) return json({ error: 'forbidden_origin' }, 403);
    try {
      const raw = await request.text();
      if (raw.length > 12000) return json({ error: 'payload_too_large' }, 413);
      let body;
      try { body = JSON.parse(raw); } catch { return json({ error: 'invalid_json' }, 400); }
      if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'invalid_payload' }, 400);
      if (body.website) return json({ ok: true }); // honeypot: pretend success, store nothing
      const trim = (k) => (typeof body[k] === 'string' ? body[k].trim() : '');
      const name = trim('name'), email = trim('email').toLowerCase(), message = trim('message');
      const lang = pickLang(body.locale);
      if (!name || name.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320 || !message || message.length > 5000) return json({ error: 'invalid_fields' }, 400);
      if (!db) return json({ error: 'database_not_configured' }, 503);

      const since = new Date(now().getTime() - PER_EMAIL_WINDOW_MIN * 60000).toISOString();
      const { count } = await db.from('contact_messages').select('id', { count: 'exact', head: true }).eq('email', email).gte('created_at', since);
      if ((count ?? 0) >= PER_EMAIL_LIMIT) return json({ error: 'too_many_requests' }, 429);

      const { data: saved, error } = await db.from('contact_messages').insert({ name, email, message, locale: lang }).select('id').single();
      if (error) return json({ error: 'save_failed' }, 500);
      if (!mailReady) return json({ ok: true, email: 'pending' }, 201);

      // Global cap on auto-replies so a flood of fake addresses cannot turn the form into a mailer.
      // shortcut: the count-then-insert checks are not atomic, so parallel bursts can slightly exceed both caps; move to a SQL function if abused.
      const hourAgo = new Date(now().getTime() - 3600000).toISOString();
      const { count: lastHour } = await db.from('contact_messages').select('id', { count: 'exact', head: true }).gte('created_at', hourAgo);
      const notice = contactNoticeEmail({ name, email, message, lang, receivedAt: now() });
      const reply = contactReplyEmail({ lang });
      const [noticed, replied] = await Promise.all([
        send({ from: `Web Barcelona Country <${from}>`, to: [inbox], reply_to: `${name.replace(/[<>"]/g, '')} <${email}>`, subject: notice.subject, html: notice.html, text: notice.text }),
        (lastHour ?? 0) <= AUTOREPLY_PER_HOUR ? send({ from: `Barcelona Country Festival <${from}>`, to: [email], reply_to: CONTACT_EMAIL, subject: reply.subject, html: reply.html, text: reply.text }) : false,
      ]);
      await db.from('contact_messages').update({ notified_at: noticed ? now().toISOString() : null, replied_at: replied ? now().toISOString() : null }).eq('id', saved.id);
      return json({ ok: true, email: noticed ? 'sent' : 'pending' }, 201);
    } catch {
      return json({ error: 'service_unavailable' }, 500);
    }
  };
}
