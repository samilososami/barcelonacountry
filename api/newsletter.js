import { createNewsletterHandler } from '../server/newsletter.mjs';

export const POST = request => createNewsletterHandler()(request);
export const GET = () => Response.json({ error: 'method_not_allowed' }, { status: 405 });
