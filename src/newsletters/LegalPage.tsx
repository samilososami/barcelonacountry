import { useEffect, useState } from "react";
import { newsCopy, type NewsLanguage } from "./copy";
import { ArrowIcon } from "../components/ArrowIcon";
import { legalDocuments } from "../privacy/legal-content";
import { CookiePreferencesButton } from "../privacy/CookieConsent";
import { registrationCopy } from "../privacy/registration-copy";
import "./news.css";

export function LegalPage({ language }: { language: NewsLanguage }) {
  const t = newsCopy[language];
  const key = window.location.pathname.replace(/^\/|\/$/g, "");
  const isUnsubscribe = key === "baja";
  const document = legalDocuments[key as keyof typeof legalDocuments];
  const title = isUnsubscribe ? t.unsubscribe : document?.title ?? t.legal;
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => { window.document.title = `${title} | Barcelona Country Fest`; window.document.documentElement.lang = language; }, [title, language]);
  async function unsubscribe() {
    setBusy(true);
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "unsubscribe", token: new URLSearchParams(window.location.search).get("token") }) });
      if (!response.ok) throw new Error();
      setStatus(t.unsubscribed); setDone(true);
    } catch { setStatus(t.retry); }
    finally { setBusy(false); }
  }
  return <div className="modern-page news-page">
    <header className="news-header"><a href="/" aria-label="Barcelona Country Fest"><img src="/assets/logo-primary-senyera.png" alt="Barcelona Country Fest" /></a><a href="/"><ArrowIcon direction="left" /> {t.back}</a></header>
    <main className="news-main legal-main">
      {!isUnsubscribe && <nav className="legal-navigation" aria-label={t.legal}>
        <a href="/privacidad" aria-current={key === "privacidad" ? "page" : undefined}>{t.privacy}</a>
        <a href="/aviso-legal" aria-current={key === "aviso-legal" ? "page" : undefined}>{t.legal}</a>
        <a href="/cookies" aria-current={key === "cookies" ? "page" : undefined}>{t.cookies}</a>
      </nav>}
      <article className="news-article legal-document" lang={isUnsubscribe ? language : "es"}>
        <p className="news-number">Barcelona Country Fest</p><h1>{title}</h1>
        {isUnsubscribe ? <><p role="status">{status}</p>{!done && <button className="news-subscribe-link" disabled={busy} onClick={unsubscribe}>{busy ? "…" : t.unsubscribe}</button>}</> : document ? <>
          <p className="legal-updated">Última actualización: <time dateTime={document.updatedAt}>{new Intl.DateTimeFormat("es", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${document.updatedAt}T12:00:00Z`))}</time></p>
          {language !== "es" && <p className="legal-language-note" lang={language}>{registrationCopy[language].spanishDocument}</p>}
          {key === "cookies" && <div className="legal-preferences"><CookiePreferencesButton language={language} /></div>}
          <nav className="legal-index" aria-label="Contenido del documento"><ol>{document.sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ol></nav>
          {document.sections.map(section => <section className="legal-section" key={section.id} id={section.id}>
            <h2>{section.title}</h2>
            {section.paragraphs?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            {section.items && <ul>{section.items.map((item, index) => <li key={index}>{item}</li>)}</ul>}
            {section.links && <ul className="legal-links">{section.links.map(link => <li key={link.href}><a href={link.href} {...(link.href.startsWith("https:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{link.label}</a></li>)}</ul>}
          </section>)}
        </> : <p>{t.pending}</p>}
      </article>
    </main>
    <footer className="news-footer"><a href="/">Barcelona Country Fest</a><a href="mailto:privacidad@barcelonacountry.com">privacidad@barcelonacountry.com</a><CookiePreferencesButton /></footer>
  </div>;
}
