import { createContactHandler } from '../server/contact.mjs';

export const POST = request => createContactHandler()(request);
export const GET = () => Response.json({ error: 'method_not_allowed' }, { status: 405 });
