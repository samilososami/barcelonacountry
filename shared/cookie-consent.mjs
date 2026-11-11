// Only explicitly chosen Google Maps consent enables third-party embeds.
export const COOKIE_CONSENT_KEY = 'bcf-cookie-consent';
export const COOKIE_CONSENT_VERSION = 1;
export const COOKIE_CONSENT_TTL_MS = 180 * 24 * 60 * 60 * 1000;

export function createCookieConsent(maps, now = Date.now()) {
  if (typeof maps !== 'boolean' || !Number.isSafeInteger(now) || now <= 0) {
    throw new TypeError('Invalid cookie consent');
  }
  return { version: COOKIE_CONSENT_VERSION, maps, savedAt: now, expiresAt: now + COOKIE_CONSENT_TTL_MS };
}

export function parseCookieConsent(raw, now = Date.now()) {
  if (typeof raw !== 'string' || raw.length > 1024 || !Number.isFinite(now)) return null;
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)
      || value.version !== COOKIE_CONSENT_VERSION || typeof value.maps !== 'boolean'
      || !Number.isSafeInteger(value.savedAt) || value.savedAt <= 0 || value.savedAt > now
      || value.expiresAt !== value.savedAt + COOKIE_CONSENT_TTL_MS || now >= value.expiresAt) return null;
    return { version: value.version, maps: value.maps, savedAt: value.savedAt, expiresAt: value.expiresAt };
  } catch { return null; }
}
