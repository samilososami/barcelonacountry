import test from 'node:test';
import assert from 'node:assert/strict';
import { createNewsletterHandler, unsubscribeToken, verifyUnsubscribe, welcomeEmail } from '../server/newsletter.mjs';

const env = { SUPABASE_URL: 'https://test.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'public', SUPABASE_SERVICE_ROLE_KEY: 'test-secret', NEWSLETTER_SIGNING_SECRET: 'test-signature', RESEND_API_KEY: 'test-mail', NEWSLETTER_FROM_EMAIL: 'news@example.com', NODE_ENV: 'production' };
const input = { action: 'subscribe', full_name: 'Test Dancer', email: 'dancer@example.com', phone: '+34 600000000', country_iso: 'ES', dance_location: 'Test dance hall', consent: true, privacy_accepted: true, locale: 'es' };
const issue = { issue_number: 1, is_published: true, slug: 'primer-numero', title: 'Primer número', content: 'Contenido aprobado\n\n## Artistas\n\nNos vemos en Barcelona.' };
function harness({ configured = true, published = true, mailFails = false, throws = false, admin = false } = {}) {
  const rows = []; const emails = []; const tables = [];
  const client = {
    auth: { getUser: async token => ({ data: { user: token === 'admin-token' ? { id: 'admin' } : null } }) },
    from(table) {
      tables.push(table);
      let op = 'select', data, count = false, head = false; const filters = [];
      const query = {
        insert(value) { op = 'insert'; data = value; return query; },
        update(value) { op = 'update'; data = value; return query; },
        select(_cols, options) { count = options?.count; head = options?.head; return query; },
        eq(key, value) { filters.push(row => row[key] === value); return query; },
        is(key, value) { filters.push(row => (row[key] ?? null) === value); return query; },
        order() { return query; }, limit() { return query; },
        maybeSingle() { return query.then(r => ({ ...r, data: r.data?.[0] ?? null })); },
        then(resolve, reject) {
          return Promise.resolve().then(() => {
            if (op === 'insert') {
              if (rows.some(row => row.email === data.email)) return { error: { code: '23505' } };
              rows.push({ ...data, welcome_newsletter_sent_at: null }); return { error: null };
            }
            const selected = (table === 'registrations' ? rows : table === 'newsletter_issues' ? published ? [issue] : [] : admin ? [{ user_id: 'admin' }] : []).filter(row => filters.every(f => f(row)));
            if (op === 'update') selected.forEach(row => Object.assign(row, data));
            return { data: head ? null : selected, error: null, count: count ? selected.length : undefined };
          }).then(resolve, reject);
        }
      }; return query;
    }
  };
  const handler = createNewsletterHandler({ env: configured ? env : { ...env, RESEND_API_KEY: '' }, clientFactory: () => client, sendFetch: async (_url, options) => {
    emails.push(options); if (throws) throw new Error('timeout');
    return Response.json(mailFails ? { error: 'fail' } : { id: 'mail-1' }, { status: mailFails ? 503 : 200 });
  } });
  const request = (body, headers = {}) => handler(new Request('https://bcncountryfest.com/api/newsletter', { method: 'POST', headers: { origin: 'https://bcncountryfest.com', 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) }));
  return { rows, emails, tables, request, handler };
}

test('subscription persists consent and sends issue 1 with blog and unsubscribe links', async () => {
  const h = harness(); const before = Date.now(); const response = await h.request({ ...input, privacy_accepted_at: '1900-01-01T00:00:00.000Z' });
  assert.equal(response.status, 201); assert.equal((await response.json()).welcome_email, 'sent');
  assert.equal(h.rows[0].newsletter_consent, true);
  assert.ok(Date.parse(h.rows[0].privacy_accepted_at) >= before);
  assert.ok(Date.parse(h.rows[0].privacy_accepted_at) <= Date.now());
  assert.ok(h.rows[0].welcome_newsletter_sent_at);
  const mail = JSON.parse(h.emails[0].body);
  assert.match(mail.html, /https:\/\/www.barcelonacountry.com\/newsletters\/primer-numero/);
  assert.equal(mail.reply_to, 'info@barcelonacountry.com');
  assert.match(mail.html, /\/baja\?token=/); assert.deepEqual(mail.to, [input.email]);
  assert.match(h.emails[0].headers['Idempotency-Key'], /^welcome-v1-/);
});
test('subscription without explicit consent is rejected before persistence or email delivery', async () => {
  for (const configured of [true, false]) {
    const h = harness({ configured });
    const result = await h.request({ ...input, consent: false });
    assert.equal(result.status, 400);
    assert.deepEqual(await result.json(), { error: 'invalid_fields' });
    assert.deepEqual(h.rows, []);
    assert.deepEqual(h.tables, []);
    assert.deepEqual(h.emails, []);
  }
});
test('privacy acceptance is mandatory and consent values are never coerced', async () => {
  for (const consent of [true, false]) {
    for (const privacy_accepted of [undefined, false, null, 'true', 1]) {
      const h = harness();
      assert.equal((await h.request({ ...input, consent, privacy_accepted })).status, 400);
      assert.deepEqual(h.rows, []);
      assert.deepEqual(h.emails, []);
    }
  }
  for (const consent of [undefined, null, 'true', 'false', 0, 1, {}, []]) {
    const h = harness();
    assert.equal((await h.request({ ...input, consent })).status, 400);
    assert.deepEqual(h.rows, []);
    assert.deepEqual(h.emails, []);
  }
});
test('missing configuration, missing first issue, provider error and timeout preserve signup as pending', async () => {
  for (const options of [{ configured: false }, { published: false }, { mailFails: true }, { throws: true }]) {
    const h = harness(options); const result = await h.request(input);
    assert.equal(result.status, 201); assert.equal((await result.json()).welcome_email, 'pending');
    assert.equal(h.rows.length, 1); assert.equal(h.rows[0].welcome_newsletter_sent_at, null);
  }
});
test('duplicates never produce a second email', async () => {
  const h = harness(); await h.request(input);
  assert.equal((await h.request(input)).status, 409); assert.equal(h.emails.length, 1); assert.equal(h.rows.length, 1);
});
test('validation, honeypot and unknown origins reject or discard without storing', async () => {
  const h = harness();
  for (const override of [{ privacy_accepted: false }, { email: 'bad' }, { phone: '<script>' }, { dance_location: '' }, { full_name: 'x'.repeat(161) }]) assert.equal((await h.request({ ...input, ...override })).status, 400);
  assert.equal((await h.request(input, { origin: 'https://untrusted.example' })).status, 403);
  assert.equal((await h.request({ ...input, website: 'bot' })).status, 201); assert.equal(h.rows.length, 0);
});
test('unsubscription requires a valid signed token, is repeatable and excludes retries', async () => {
  const h = harness({ configured: false, admin: true }); await h.request(input);
  const token = unsubscribeToken(h.rows[0].id, env.NEWSLETTER_SIGNING_SECRET);
  assert.equal(verifyUnsubscribe(token + '0', env.NEWSLETTER_SIGNING_SECRET), null);
  assert.equal((await h.request({ action: 'unsubscribe', token: 'forged' })).status, 400);
  for (let n = 0; n < 2; n++) assert.equal((await h.request({ action: 'unsubscribe', token })).status, 200);
  assert.equal(h.rows[0].newsletter_consent, false);
  const status = await h.request({ action: 'status' }, { Authorization: 'Bearer admin-token' });
  assert.equal((await status.json()).pending, 0);
});
test('dispatch is admin-only and does not resend already accepted deliveries', async () => {
  const h = harness({ admin: true });
  assert.equal((await h.request({ action: 'dispatch' })).status, 401);
  assert.equal((await h.request({ action: 'dispatch' }, { Authorization: 'Bearer invalid' })).status, 401);
  const denied = harness(); assert.equal((await denied.request({ action: 'dispatch' }, { Authorization: 'Bearer admin-token' })).status, 403);
  await h.request(input);
  const result = await h.request({ action: 'dispatch' }, { Authorization: 'Bearer admin-token' });
  assert.deepEqual(await result.json(), { sent: 0, pending: 0 }); assert.equal(h.emails.length, 1);
});
test('GET never unsubscribes and hostile editorial HTML is escaped', async () => {
  const h = harness(); assert.equal((await h.handler(new Request('https://bcncountryfest.com/api/newsletter?action=unsubscribe'))).status, 405);
  const mail = welcomeEmail({ id: 'id', full_name: '<img onerror=alert(1)>', email: input.email }, { ...issue, title: '<script>', content: '<img src=x onerror=alert(1)>' }, 'secret', 'news@example.com');
  assert.ok(mail.html.includes('&lt;script&gt;')); assert.ok(!mail.html.includes('<img src=x'));
});

test('an administrator can retry a pending welcome once configuration is available', async () => {
  const h = harness({ admin: true });
  h.rows.push({ ...input, id: '00000000-0000-4000-8000-000000000001', newsletter_consent: true, welcome_newsletter_sent_at: null });
  const result = await h.request({ action: 'dispatch' }, { Authorization: 'Bearer admin-token' });
  assert.deepEqual(await result.json(), { sent: 1, pending: 0 });
  assert.equal(h.emails.length, 1); assert.ok(h.rows[0].welcome_newsletter_sent_at);
  await h.request({ action: 'dispatch' }, { Authorization: 'Bearer admin-token' });
  assert.equal(h.emails.length, 1);
});

test('mail-client one-click POST unsubscribes without treating GET as an action', async () => {
  const h = harness({ configured: false }); await h.request(input);
  const token = unsubscribeToken(h.rows[0].id, env.NEWSLETTER_SIGNING_SECRET);
  const result = await h.handler(new Request(`https://bcncountryfest.com/api/newsletter?action=unsubscribe&token=${token}`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'List-Unsubscribe=One-Click' }));
  assert.equal(result.status, 200); assert.equal(h.rows[0].newsletter_consent, false);
});
