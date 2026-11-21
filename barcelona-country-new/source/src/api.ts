// The real /api lives only on the official domains (Vercel project `barcelonacountry`).
// Preview hosts (vercel.app, samilososami.com, localhost) keep the forms in design-preview mode.
const previewHost = /(^|\.)(vercel\.app|samilososami\.com|localhost|127\.0\.0\.1)$/.test(window.location.hostname);
export const apiBase: string | null = previewHost ? null : '/api';
