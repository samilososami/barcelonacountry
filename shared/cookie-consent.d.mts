export type CookieConsent = { version: number; maps: boolean; savedAt: number; expiresAt: number };
export const COOKIE_CONSENT_KEY: string;
export const COOKIE_CONSENT_VERSION: number;
export const COOKIE_CONSENT_TTL_MS: number;
export function createCookieConsent(maps: boolean, now?: number): CookieConsent;
export function parseCookieConsent(raw: string | null, now?: number): CookieConsent | null;
