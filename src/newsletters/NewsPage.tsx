import { useEffect, useState } from "react";
import { assetPath, sitePath, currentSitePath } from "../lib/site";
import type { NewsletterIssue } from "../lib/database.types";
import { newsCopy, type NewsLanguage } from "./copy";
import { IssueBody } from "./IssueBody";
import { ArrowIcon } from "../components/ArrowIcon";
import { CookiePreferencesButton } from "../privacy/CookieConsent";
import "./news.css";

export function NewsPage({ language }: { language: NewsLanguage }) {
  const t = newsCopy[language];
  const slug = decodeURIComponent(currentSitePath().split("/")[2] ?? "");
  const [issues, setIssues] = useState<NewsletterIssue[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    // The design preview deliberately has no database connection.
    setIssues([]); setState("ready");
  }, [attempt]);
  const issue = issues.find(item => item.slug === slug);
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = `${issue?.title ?? "Barcelona Country News"} | Barcelona Country Festival`;
  }, [issue?.title, language]);
  return <div className="modern-page news-page">
    <header className="news-header"><a href={sitePath("/")} aria-label="Barcelona Country Festival"><img src={assetPath("/assets/brand-logo-nav.png")} alt="Barcelona Country Festival" /></a><a href={sitePath("/")}><ArrowIcon direction="left" /> {t.back}</a></header>
    <main className="news-main">
      <div className="news-masthead"><p>{t.archive}</p><h1>Barcelona Country <em>News</em></h1><span>{t.archiveIntro}</span></div>
      {state === "loading" ? <p role="status" className="news-state">{t.loading}</p> : state === "error" ? <div className="news-state" role="alert"><p>{t.error}</p><button onClick={() => setAttempt(n => n + 1)}>{t.retry}</button></div> : slug ? issue ?
        <article className="news-article"><a href={sitePath("/newsletters")}><ArrowIcon direction="left" /> Barcelona Country News</a><p className="news-number">{t.issue} {String(issue.issue_number).padStart(2, "0")}</p><h2>{issue.title}</h2><p className="news-excerpt">{issue.excerpt}</p><IssueBody content={issue.content} /><a className="news-subscribe-link" href={sitePath("/#newsletter")}>{t.subscribe} <ArrowIcon direction="up-right" /></a></article>
        : <div className="news-state"><p>{t.error}</p><a href={sitePath("/newsletters")}><ArrowIcon direction="left" /> Barcelona Country News</a></div> : issues.length ?
        <div className="news-grid">{issues.map(item => <article key={item.id} className="news-card"><p className="news-number">{t.issue} {String(item.issue_number).padStart(2, "0")}</p><h2>{item.title}</h2><p>{item.excerpt}</p><a href={sitePath(`/newsletters/${item.slug}`)}>{t.read} <ArrowIcon direction="up-right" /></a></article>)}</div> :
        <section className="news-coming"><span className="news-coming-number" aria-hidden="true">01</span><div><p className="news-number">Barcelona Country News</p><h2>{t.empty}</h2><p>{t.emptyBody}</p><a className="news-subscribe-link" href={sitePath("/#newsletter")}>{t.subscribe} <ArrowIcon direction="up-right" /></a></div></section>}
    </main><footer className="news-footer"><span>Barcelona Country Festival · 22-23-24 OCT 2027</span><a href={sitePath("/privacidad")}>{t.privacy}</a><a href={sitePath("/aviso-legal")}>{t.legal}</a><a href={sitePath("/cookies")}>{t.cookies}</a><CookiePreferencesButton /></footer>
  </div>;
}
