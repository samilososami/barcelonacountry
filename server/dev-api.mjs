import { createNewsletterHandler } from './newsletter.mjs';

// Vite and Vercel exercise the same handler; no separate development implementation.
export function newsletterDevApi(env) {
  return {
    name: 'newsletter-api',
    configureServer(server) {
      server.middlewares.use('/api/newsletter', async (req, res) => {
        try {
          const chunks = [];
          let bytes = 0;
          for await (const chunk of req) {
            bytes += chunk.length;
            if (bytes > 8192) { res.statusCode = 413; res.end(); return; }
            chunks.push(chunk);
          }
          const body = Buffer.concat(chunks).toString();
          const request = new Request(`http://${req.headers.host}/api/newsletter${req.url === '/' ? '' : req.url}`, { method: req.method, headers: req.headers, ...(req.method === 'POST' ? { body } : {}) });
          const response = await createNewsletterHandler({ env: { ...env, NODE_ENV: 'development' } })(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(await response.text());
        } catch { res.statusCode = 500; res.end('{"error":"service_unavailable"}'); }
      });
    }
  };
}
