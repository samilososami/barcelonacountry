// Barcelona Country News: published issues, read straight from Supabase with the public key.
// RLS only exposes rows with is_published = true, so drafts never reach the blog.
const SUPABASE_URL = 'https://chtblgjrntxlpqhffxnq.supabase.co';
const PUBLIC_KEY = 'sb_publishable_9CqB3wxIVv3e8j2mMR7zhA_CNlnlBII';

export type Issue = { id: string; issue_number: number; slug: string; title: string; excerpt: string; content: string; published_at: string | null; created_at: string };
export type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'media'; kind: 'image' | 'video' | 'audio' | 'file'; label: string; url: string };

let cache: Promise<Issue[]> | null = null;
export function loadIssues(force = false): Promise<Issue[]> {
  if (!cache || force) {
    cache = fetch(`${SUPABASE_URL}/rest/v1/newsletter_issues?select=id,issue_number,slug,title,excerpt,content,published_at,created_at&is_published=eq.true&order=issue_number.desc`, {
      headers: { apikey: PUBLIC_KEY, Authorization: `Bearer ${PUBLIC_KEY}` }
    }).then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<Issue[]>;
    });
    cache.catch(() => (cache = null));
  }
  return cache;
}

// Same grammar as the admin editor (shared/newsletter-content.mjs in the official repo).
const safeUrl = (value: string) => {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && !u.username && !u.password ? u.href : null;
  } catch {
    return null;
  }
};
export function parseContent(content: string): Block[] {
  return content
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .filter((b: string) => b.trim())
    .map((source: string): Block => {
      const m = source.trim().match(/^(!|@video|@audio|@file)\[([^\]\n]*)\]\(([^\s]+)\)$/);
      const url = m && safeUrl(m[3]);
      if (m && url) return { type: 'media', kind: m[1] === '!' ? 'image' : (m[1].slice(1) as 'video' | 'audio' | 'file'), label: m[2], url };
      if (source.startsWith('## ')) return { type: 'heading', text: source.slice(3) };
      if (source.split('\n').every((l: string) => l.startsWith('- '))) return { type: 'list', items: source.split('\n').map((l: string) => l.slice(2)) };
      return { type: 'paragraph', text: source };
    });
}

export const coverOf = (issue: Issue) => parseContent(issue.content).find((b): b is Extract<Block, { type: 'media' }> => b.type === 'media' && b.kind === 'image')?.url ?? null;
export const readingMinutes = (issue: Issue) => Math.max(1, Math.round(`${issue.excerpt} ${issue.content.replace(/\([^)]*\)/g, '')}`.split(/\s+/).length / 200));
export const issueDate = (issue: Issue, lang: string) =>
  new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(issue.published_at ?? issue.created_at));
export const pad = (n: number) => String(n).padStart(2, '0');
