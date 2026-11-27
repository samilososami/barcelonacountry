import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { res, useLang } from '../i18n';
import { useReveal } from '../lib/motion';
import { coverOf, issueDate, loadIssues, localize, pad, parseContent, readingMinutes, type Block, type Issue } from '../lib/news';
import { Arrow, Neon, Star } from '../components/ui';
import { Ribbon } from '../sections/Hero';
import { PageShell } from './Pages';
import './blog.css';

type Nav = (hash: string) => void;
const link = (nav: Nav, hash: string) => ({ href: hash, onClick: (e: MouseEvent) => { e.preventDefault(); nav(hash); } });

export function BlogPage({ slug, onHome, onNavigate }: { slug: string; onHome: (target?: string) => void; onNavigate: Nav }) {
  const { t, lang } = useLang();
  const [raw, setIssues] = useState<Issue[] | null>(null);
  const issues = useMemo(() => raw?.map((i) => localize(i, lang)) ?? null, [raw, lang]);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    setFailed(false);
    loadIssues(attempt > 0)
      .then((list) => live && setIssues(list))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [attempt]);

  const index = slug && issues ? issues.findIndex((i) => i.slug === slug) : -1;
  const issue = index >= 0 ? issues![index] : null;
  useEffect(() => {
    document.title = `${issue?.title ?? 'Barcelona Country News'} | Barcelona Country Festival`;
  }, [issue]);

  const state = failed ? (
    <div className="gz-state" role="alert">
      <p>{t.news.error}</p>
      <button type="button" className="btn btn-ink btn-sm" onClick={() => setAttempt((n) => n + 1)}>
        <span>{t.news.retry}</span>
      </button>
    </div>
  ) : !issues ? (
    <p className="gz-state" role="status">
      <Star /> {t.news.loading}
    </p>
  ) : null;

  return (
    <PageShell onHome={onHome} bleed>
      {slug ? (
        issue ? (
          <Article issue={issue} newer={issues![index - 1]} older={issues![index + 1]} nav={onNavigate} />
        ) : (
          <div className="gz-wrap">
            {state ?? (
              <div className="gz-state">
                <p>{t.blog.notFound}</p>
                <a className="btn btn-ink btn-sm" {...link(onNavigate, '#/blog')}>
                  <Arrow dir="left" />
                  <span>{t.blog.all}</span>
                </a>
              </div>
            )}
          </div>
        )
      ) : (
        <Gazette issues={issues} state={state} nav={onNavigate} />
      )}
      <Ticket onSubscribe={() => onHome('newsletter')} />
    </PageShell>
  );
}

function useLit() {
  const [lit, setLit] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setLit(true), 450);
    return () => window.clearTimeout(id);
  }, []);
  return lit;
}

/* ---------- archive: a festival gazette ---------- */
function Gazette({ issues, state, nav }: { issues: Issue[] | null; state: ReactNode; nav: Nav }) {
  const { t, lang } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const lit = useLit();
  useReveal(root, [issues?.length]);
  const [lead, ...rest] = issues ?? [];
  return (
    <div className="gz" ref={root}>
      <header className="gz-mast">
        <div className="gz-wrap">
        <div className="gz-rule">
          <span>{t.blog.edition}</span>
          <Star />
          <span>Barcelona · {t.date.city}</span>
          <Star />
          <span>
            {t.date.days.replace(/-/g, '·')} {t.date.month} {t.date.year}
          </span>
        </div>
        <h1 className="gz-title">
          <span>Barcelona Country</span>
          <Neon text="News" lit={lit} className="gz-neon" />
        </h1>
        <div className="gz-sub">
          <p className="kicker">
            <Star /> {t.news.archive}
          </p>
          <p className="gz-intro">{t.news.archiveIntro}</p>
          {issues && issues.length > 0 && (
            <p className="gz-count">
              <b>{pad(issues.length)}</b> {t.blog.issues}
            </p>
          )}
        </div>
        </div>
      </header>

      <div className="gz-ribbon" aria-hidden="true">
        <Ribbon words={[...t.triad, 'Barcelona Country News', t.date.city]} />
      </div>

      <div className="gz-wrap gz-body">
        {state}
        {issues && !issues.length && (
          <section className="gz-empty" data-reveal>
            <span className="gz-outline" aria-hidden="true">
              01
            </span>
            <div>
              <p className="kicker">
                <Star /> Barcelona Country News
              </p>
              <h2>{t.news.empty}</h2>
              <p>{t.news.emptyBody}</p>
            </div>
          </section>
        )}
        {lead && (
          <a className="gz-lead" {...link(nav, `#/blog/${lead.slug}`)} data-reveal>
            <figure className="gz-lead-media">
              <Cover issue={lead} />
              <img className="gz-stamp" src={res('img/stamp.webp')} alt="" />
            </figure>
            <div className="gz-lead-text">
              <p className="kicker">
                <Star /> {t.blog.latest} · Nº {pad(lead.issue_number)}
              </p>
              <h2>{lead.title}</h2>
              {lead.excerpt && <p className="gz-excerpt">{lead.excerpt}</p>}
              <p className="gz-meta">
                <time dateTime={lead.published_at ?? lead.created_at}>{issueDate(lead, lang)}</time>
                <span>
                  {readingMinutes(lead)} {t.blog.minRead}
                </span>
              </p>
              <span className="btn btn-gold">
                <span>{t.news.read}</span>
                <Arrow dir="up-right" />
              </span>
            </div>
          </a>
        )}
        {rest.length > 0 && (
          <section className="gz-more" aria-labelledby="gz-more-title">
            <h2 id="gz-more-title" className="gz-more-title" data-reveal>
              {t.blog.more}
            </h2>
            <div className="gz-grid">
              {rest.map((item, i) => (
                <a key={item.id} className="gz-card" {...link(nav, `#/blog/${item.slug}`)} data-reveal data-delay={(i % 3) * 0.08}>
                  <figure>
                    <Cover issue={item} />
                  </figure>
                  <p className="gz-card-num">Nº {pad(item.issue_number)}</p>
                  <h3>{item.title}</h3>
                  {item.excerpt && <p className="gz-card-excerpt">{item.excerpt}</p>}
                  <p className="gz-meta">
                    <time dateTime={item.published_at ?? item.created_at}>{issueDate(item, lang)}</time>
                    <span>
                      {readingMinutes(item)} {t.blog.minRead}
                    </span>
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Cover({ issue }: { issue: Issue }) {
  const src = coverOf(issue);
  return src ? (
    <img className="gz-cover" src={src} alt="" loading="lazy" />
  ) : (
    <span className="gz-cover gz-cover--empty">
      <img src={res('img/isotype.webp')} alt="" />
    </span>
  );
}

/* ---------- a single issue ---------- */
function Article({ issue, newer, older, nav }: { issue: Issue; newer?: Issue; older?: Issue; nav: Nav }) {
  const { t, lang } = useLang();
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  useReveal(root, [issue.id]);
  const cover = coverOf(issue);
  const blocks = parseContent(issue.content);
  const share = () => {
    const url = `${window.location.origin}${window.location.pathname}#/blog/${issue.slug}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    });
  };
  return (
    <article className="ar" ref={root}>
      <header className={`ar-hero${cover ? ' has-cover' : ''}`}>
        {cover && <img className="ar-hero-bg" src={cover} alt="" />}
        <div className="gz-wrap ar-hero-in">
          <a className="ar-back" {...link(nav, '#/blog')}>
            <Arrow dir="left" /> {t.blog.all}
          </a>
          <p className="kicker">
            <Star /> Barcelona Country News · Nº {pad(issue.issue_number)}
          </p>
          <h1 className="ar-title">{issue.title}</h1>
          {issue.excerpt && <p className="ar-excerpt">{issue.excerpt}</p>}
          <p className="gz-meta">
            <time dateTime={issue.published_at ?? issue.created_at}>{issueDate(issue, lang)}</time>
            <span>
              {readingMinutes(issue)} {t.blog.minRead}
            </span>
          </p>
        </div>
        <span className="ar-bignum" aria-hidden="true">
          {pad(issue.issue_number)}
        </span>
      </header>

      <div className="ar-body" lang={issue.lang ?? 'es'}>
        {blocks.map((b, i) => (
          <BlockView key={i} block={b} first={i === blocks.findIndex((x) => x.type === 'paragraph')} />
        ))}
        <p className="ar-sign" data-reveal>
          <Neon text="Yeehaw!" lit className="ar-neon" />
        </p>
      </div>

      <footer className="ar-foot gz-wrap">
        <button type="button" className="btn btn-ink btn-sm" onClick={share}>
          <span>{copied ? t.blog.copied : t.blog.copy}</span>
          <Star />
        </button>
        <nav className="ar-pager" aria-label={t.blog.all}>
          {older ? (
            <a className="ar-step" {...link(nav, `#/blog/${older.slug}`)}>
              <small>
                <Arrow dir="left" /> {t.blog.prev} · Nº {pad(older.issue_number)}
              </small>
              <b>{older.title}</b>
            </a>
          ) : (
            <span />
          )}
          {newer ? (
            <a className="ar-step ar-step--next" {...link(nav, `#/blog/${newer.slug}`)}>
              <small>
                {t.blog.next} · Nº {pad(newer.issue_number)} <Arrow />
              </small>
              <b>{newer.title}</b>
            </a>
          ) : (
            <span />
          )}
        </nav>
      </footer>
    </article>
  );
}

// **bold** and *italic*, the only inline marks the newsletter editor uses.
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*\n]+\*)/g).map((part, k) => {
    if (part.startsWith('***') && part.endsWith('***') && part.length > 6) return <strong key={k}><em>{part.slice(3, -3)}</em></strong>;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={k}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={k}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function BlockView({ block, first }: { block: Block; first: boolean }) {
  const { t } = useLang();
  if (block.type === 'heading')
    return (
      <h2 className="ar-h" data-reveal>
        <Star /> {inline(block.text)}
      </h2>
    );
  if (block.type === 'list')
    return (
      <ul className="ar-list" data-reveal>
        {block.items.map((item, k) => (
          <li key={k}>
            <Star />
            <span>{inline(item)}</span>
          </li>
        ))}
      </ul>
    );
  if (block.type === 'paragraph')
    return (
      <p className={first ? 'ar-p ar-p--first' : 'ar-p'} data-reveal>
        {inline(block.text)}
      </p>
    );
  if (block.kind === 'image')
    return (
      <figure className="ar-media" data-reveal>
        <img src={block.url} alt={block.label} loading="lazy" />
        {block.label && <figcaption>{block.label}</figcaption>}
      </figure>
    );
  if (block.kind === 'video')
    return (
      <figure className="ar-media ar-media--video" data-reveal>
        <video src={block.url} controls playsInline preload="metadata" />
        {block.label && <figcaption>{block.label}</figcaption>}
      </figure>
    );
  if (block.kind === 'audio')
    return (
      <figure className="ar-audio" data-reveal>
        <figcaption>
          <Star /> {block.label}
        </figcaption>
        <audio src={block.url} controls preload="none" />
      </figure>
    );
  return (
    <a className="ar-file" href={block.url} target="_blank" rel="noopener noreferrer" data-reveal>
      <span>PDF</span>
      <b>{block.label}</b>
      <small>
        {t.blog.file} <Arrow dir="down" />
      </small>
    </a>
  );
}

/* ---------- subscribe: the festival ticket again ---------- */
function Ticket({ onSubscribe }: { onSubscribe: () => void }) {
  const { t } = useLang();
  return (
    <aside className="gz-wrap gz-ticket-wrap">
      <div className="gz-ticket">
        <div className="gz-ticket-stub" aria-hidden="true">
          <img src={res('img/isotype.webp')} alt="" />
          <span>
            {t.date.days.replace(/-/g, '·')} {t.date.month} {t.date.year}
          </span>
          <i className="gz-barcode">
            {Array.from({ length: 26 }, (_, i) => (
              <i key={i} style={{ width: `${[1, 3, 1, 2, 4, 1, 2][i % 7]}px` }} />
            ))}
          </i>
        </div>
        <div className="gz-ticket-main">
          <p className="kicker">
            <Star /> {t.blog.ctaKicker}
          </p>
          <h2>{t.blog.ctaTitle}</h2>
          <p>{t.blog.ctaBody}</p>
          <button type="button" className="btn btn-gold" onClick={onSubscribe}>
            <span>{t.news.subscribe}</span>
            <Arrow dir="up-right" />
          </button>
        </div>
      </div>
    </aside>
  );
}
