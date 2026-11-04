import test from 'node:test';
import assert from 'node:assert/strict';
import { createCookieConsent, parseCookieConsent, COOKIE_CONSENT_TTL_MS } from '../shared/cookie-consent.mjs';

const now = 1793800000000;
test('maps consent must be explicitly selected and roundtrips true or false', () => {
  for (const maps of [true, false]) {
    const choice = createCookieConsent(maps, now);
    assert.deepEqual(parseCookieConsent(JSON.stringify(choice), now + 1000), choice);
    assert.equal(choice.maps, maps);
    assert.equal(choice.expiresAt - choice.savedAt, COOKIE_CONSENT_TTL_MS);
  }
});
test('missing, malformed, future, unknown-version and coerced consent fail closed', () => {
  const valid = createCookieConsent(true, now);
  for (const raw of [null, '', 'not json', 'null', '[]', '{}', JSON.stringify({ ...valid, maps: 'true' }), JSON.stringify({ ...valid, version: 2 }), JSON.stringify({ ...valid, expiresAt: valid.expiresAt + 1 }), JSON.stringify({ ...valid, savedAt: -1 })]) {
    assert.equal(parseCookieConsent(raw, now), null);
  }
  assert.equal(parseCookieConsent(JSON.stringify(valid), now - 1), null);
});
test('consent expires at 180 days, including a persisted rejection', () => {
  for (const maps of [true, false]) {
    const choice = createCookieConsent(maps, now);
    assert.ok(parseCookieConsent(JSON.stringify(choice), choice.expiresAt - 1));
    assert.equal(parseCookieConsent(JSON.stringify(choice), choice.expiresAt), null);
  }
});
test('creating a decision rejects implicit or invalid consent', () => {
  for (const value of [undefined, null, 'true', 'false', 1, 0]) assert.throws(() => createCookieConsent(value, now), TypeError);
  assert.throws(() => createCookieConsent(true, NaN), TypeError);
});
