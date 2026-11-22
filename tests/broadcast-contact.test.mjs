import test from 'node:test';
import assert from 'node:assert/strict';
import { createNewsletterHandler } from '../server/newsletter.mjs';
import { createContactHandler } from '../server/contact.mjs';
import { contactNoticeEmail, contactReplyEmail, issueEmail } from '../server/email-templates.mjs';

const env = { SUPABASE_URL: 'https://test.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'public', SUPABASE_SERVICE_ROLE_KEY: 'test-secret', NEWSLETTER_SIGNING_SECRET: 'sig', RESEND_API_KEY: 'k', NEWSLETTER_FROM_EMAIL: 'info@example.com', NODE_ENV: 'production' };
const origin = 'https://www.barcelonacountry.com';

// In-memory tables with just the query surface the handlers use.
function fakeDb(tables) {
  return {
    auth: { getUser: async (token) => ({ data: { user: token === 'admin-token' ? { id: 'admin' } : null } }) },
    from(name) {
      const table = tables[name] ?? (tables[name] = []);
      let op = 'select', data, head = false, count = false, single = false, upsertOpts;
      const filters = [];
      const q = {
        select(_c, o) { if (op === 'select') { head = o?.head; count = o?.count; } return q; },
        insert(v) { op = 'insert'; data = v; return q; },
        update(v) { op = 'update'; data = v; return q; },
        upsert(v, o) { op = 'upsert'; data = v; upsertOpts = o; return q; },
        eq(k, v) { filters.push((r) => r[k] === v); return q; },
        is(k, v) { filters.push((r) => (r[k] ?? null) === v); return q; },
        gte(k, v) { filters.push((r) => r[k] >= v); return q; },
        order() { return q; }, limit() { return q; },
        single() { single = true; return q; }, maybeSingle() { single = true; return q; },
        then(res, rej) {
          return Promise.resolve().then(() => {
            if (op === 'insert') { const row = { id: `m${table.length + 1}`, created_at: new Date().toISOString(), ...data }; table.push(row); return { data: single ? row : [row], error: null }; }
            if (op === 'upsert') { for (const r of data) if (!table.some((t) => t.issue_id === r.issue_id && t.registration_id === r.registration_id)) table.push(r); return { error: null }; }
            const rows = table.filter((r) => filters.every((f) => f(r)));
            if (op === 'update') { rows.forEach((r) => Object.assign(r, data)); return { error: null }; }
            return { data: head ? null : single ? rows[0] ?? null : rows, count: count ? rows.length : undefined, error: null };
          }).then(res, rej);
        },
      };
      return q;
    },
  };
}

function newsletterHarness(subscribers = 3) {
  const tables = {
    admin_users: [{ user_id: 'admin' }],
    newsletter_issues: [{ id: 'iss-2', issue_number: 2, slug: 'numero-2', title: 'Número dos', excerpt: 'Resumen', content: 'Hola', is_published: true }],
    registrations: Array.from({ length: subscribers }, (_, i) => ({ id: `00000000-0000-4000-8000-00000000000${i}`, full_name: `Persona ${i}`, email: `p${i}@example.com`, newsletter_consent: i !== 1, subscription_locale: 'ca', created_at: `2026-01-0${i + 1}` })),
    newsletter_deliveries: [],
  };
  const calls = [];
  const db = fakeDb(tables);
  const handler = createNewsletterHandler({ env, clientFactory: () => db, sendFetch: async (url, o) => { calls.push({ url, body: JSON.parse(o.body), headers: o.headers }); const b = JSON.parse(o.body); return Response.json(Array.isArray(b) ? { data: b.map((_, i) => ({ id: `e${i}` })) } : { id: 'e0' }); } });
  const request = (body, token = 'admin-token') => handler(new Request(`${origin}/api/newsletter`, { method: 'POST', headers: { origin, 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) }));
  return { tables, calls, request };
}

test('test send goes only to the given address, marked as a test, and records nothing', async () => {
  const h = newsletterHarness();
  assert.equal((await h.request({ action: 'test', issue_id: 'iss-2', to: 'me@example.com' }, null)).status, 401);
  assert.equal((await h.request({ action: 'test', issue_id: 'iss-2', to: 'not-an-email' })).status, 400);
  const r = await h.request({ action: 'test', issue_id: 'iss-2', to: 'Me@Example.com', name: 'Sami' });
  assert.equal(r.status, 200);
  assert.equal(h.calls.length, 1); assert.deepEqual(h.calls[0].body.to, ['me@example.com']);
  assert.match(h.calls[0].body.subject, /^\[PRUEBA\] /);
  assert.equal(h.tables.newsletter_deliveries.length, 0);
});

test('broadcast sends the issue once to consenting subscribers only, in batches, and never twice', async () => {
  const h = newsletterHarness(3);
  const first = await (await h.request({ action: 'broadcast', issue_id: 'iss-2' })).json();
  assert.deepEqual(first, { sent: 2, remaining: 0, total: 2 });
  assert.match(h.calls[0].url, /\/emails\/batch$/);
  assert.deepEqual(h.calls[0].body.map((m) => m.to[0]), ['p0@example.com', 'p2@example.com']);
  assert.ok(h.calls[0].body.every((m) => m.headers['List-Unsubscribe'] && /\/baja\?token=/.test(m.html)));
  assert.match(h.calls[0].headers['Idempotency-Key'], /^issue-iss-2-/);
  const again = await (await h.request({ action: 'broadcast', issue_id: 'iss-2' })).json();
  assert.deepEqual(again, { sent: 0, remaining: 0, total: 2 });
  assert.equal(h.calls.length, 1);
});

test('broadcast refuses drafts', async () => {
  const h = newsletterHarness(); h.tables.newsletter_issues[0].is_published = false;
  assert.equal((await h.request({ action: 'broadcast', issue_id: 'iss-2' })).status, 409);
  assert.equal(h.calls.length, 0);
});

function contactHarness({ mail = true } = {}) {
  const tables = { contact_messages: [] }; const calls = [];
  const handler = createContactHandler({ env: mail ? env : { ...env, RESEND_API_KEY: '' }, clientFactory: () => fakeDb(tables), sendFetch: async (url, o) => { calls.push(JSON.parse(o.body)); return Response.json({ id: 'x' }); } });
  const request = (body, o = origin) => handler(new Request(`${origin}/api/contact`, { method: 'POST', headers: { origin: o, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }));
  return { tables, calls, request };
}
const msg = { name: 'Ana <b>', email: 'Ana@Example.com', message: 'Hola\n<script>x</script>', locale: 'fr' };

test('contact stores the message, notifies the inbox (reply-to sender) and auto-replies in the visitor language', async () => {
  const h = contactHarness();
  const r = await h.request(msg);
  assert.equal(r.status, 201);
  assert.equal(h.tables.contact_messages.length, 1); assert.equal(h.tables.contact_messages[0].email, 'ana@example.com');
  const notice = h.calls.find((c) => c.to[0] === 'info@barcelonacountry.com');
  const reply = h.calls.find((c) => c.to[0] === 'ana@example.com');
  assert.match(notice.reply_to, /ana@example.com/); assert.equal(reply.reply_to, 'info@barcelonacountry.com');
  assert.match(reply.subject, /Nous avons reçu/);
  assert.ok(!notice.html.includes('<script>x') && notice.html.includes('&lt;script&gt;'));
  assert.ok(h.tables.contact_messages[0].notified_at && h.tables.contact_messages[0].replied_at);
  assert.ok(!reply.html.includes('Hola'));
});

test('auto-replies stop past the hourly cap, but the inbox is still notified', async () => {
  const h = contactHarness();
  for (let i = 0; i < 41; i++) h.tables.contact_messages.push({ id: `old${i}`, email: `x${i}@example.com`, created_at: new Date().toISOString() });
  assert.equal((await h.request(msg)).status, 201);
  assert.ok(h.calls.some((c) => c.to[0] === 'info@barcelonacountry.com'));
  assert.ok(!h.calls.some((c) => c.to[0] === 'ana@example.com'));
});

test('contact validates, honours the honeypot, blocks foreign origins and rate-limits per email', async () => {
  const h = contactHarness();
  assert.equal((await h.request({ ...msg, email: 'bad' })).status, 400);
  assert.equal((await h.request({ ...msg, message: '' })).status, 400);
  assert.equal((await h.request(msg, 'https://evil.example')).status, 403);
  assert.equal((await h.request({ ...msg, website: 'bot' })).status, 200);
  assert.equal(h.tables.contact_messages.length, 0);
  for (let i = 0; i < 3; i++) assert.equal((await h.request(msg)).status, 201);
  assert.equal((await h.request(msg)).status, 429);
});

test('without mail configuration the message is still saved', async () => {
  const h = contactHarness({ mail: false });
  assert.equal((await h.request(msg)).status, 201);
  assert.equal(h.tables.contact_messages.length, 1); assert.equal(h.calls.length, 0);
});

test('templates escape user text and carry the festival frame in every language', () => {
  for (const lang of ['es', 'ca', 'en', 'fr', 'it', 'de', 'xx']) {
    const m = issueEmail({ issue: { issue_number: 3, slug: 's', title: '<i>T</i>', excerpt: '', content: 'x' }, name: '<b>N', lang, unsubscribeUrl: 'https://www.barcelonacountry.com/baja?token=t' });
    assert.ok(!m.html.includes('<i>T</i>') && m.html.includes('FIRA CORNELLÀ') && m.html.includes('/baja?token=t'));
  }
  const reply = contactReplyEmail({ name: 'Spam <b>', message: 'buy pills', lang: 'es' });
  assert.ok(!reply.html.includes('pills') && !reply.html.includes('Spam') && !reply.text.includes('pills'));
  assert.match(contactNoticeEmail({ name: 'A', email: 'a@b.co', message: 'm' }).subject, /^Contacto web/);
  const evil = contactNoticeEmail({ name: 'A', email: 'a@b.co?cc=x@y.z&body=hi', message: 'm' }).html;
  assert.ok(!evil.includes('mailto:a@b.co?cc=') && evil.includes('mailto:a%40b.co%3Fcc%3D'));
});
