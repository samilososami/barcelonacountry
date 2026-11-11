import { useEffect, useState } from "react";
import { newsCopy, type NewsLanguage } from "./copy";
import { ArrowIcon } from "../components/ArrowIcon";
import { legalDocuments } from "../privacy/legal-content";
import { CookiePreferencesButton } from "../privacy/CookieConsent";
import { registrationCopy } from "../privacy/registration-copy";
import { assetPath, sitePath, currentSitePath } from "../lib/site";
import "./news.css";

// Link existing words without adding or rewriting the approved document text.
function LegalText({ text }: { text: string }) {
  const links: Record<string, string> = {
    "privacidad@barcelonacountryfest.com": "mailto:privacidad@barcelonacountryfest.com",
    "https://www.barcelonacountry.com/": "https://www.barcelonacountry.com/",
    "Política de Privacidad": sitePath("/privacidad"),
    "Política de Cookies": sitePath("/cookies")
  };
  return text.split(/(privacidad@barcelonacountryfest\.com|https:\/\/www\.barcelonacountry\.com\/|Política de Privacidad|Política de Cookies)/g).map((part, index) =>
    links[part] ? <a key={index} href={links[part]}>{part}</a> : part
  );
}

export function LegalPage({ language }: { language: NewsLanguage }) {
  const t = newsCopy[language];
  const key = currentSitePath().replace(/^\/|\/$/g, "");
  const isUnsubscribe = key === "baja";
  const document = legalDocuments[key as keyof typeof legalDocuments];
  const title = isUnsubscribe ? t.unsubscribe : document?.title ?? t.legal;
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => { window.document.title = `${title} | Barcelona Country Festival`; window.document.documentElement.lang = language; }, [title, language]);
  async function unsubscribe() {
    setBusy(true);
    try {
      const response = await fetch(sitePath("/api/newsletter"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unsubscribe", token: new URLSearchParams(window.location.search).get("token") })
      });
      if (!response.ok) throw new Error();
      setStatus(t.unsubscribed); setDone(true);
    } catch { setStatus(t.retry); }
    finally { setBusy(false); }
  }
  return <div className="modern-page news-page">
    <header className="news-header"><a href={sitePath("/")} aria-label="Barcelona Country Festival"><img src={assetPath("/assets/brand-logo-nav.png")} alt="Barcelona Country Festival" /></a><a href={sitePath("/")}><ArrowIcon direction="left" /> {t.back}</a></header>
    <main className="news-main legal-main">
      {!isUnsubscribe && <nav className="legal-navigation" aria-label={t.legal}>
        <a href={sitePath("/privacidad")} aria-current={key === "privacidad" ? "page" : undefined}>{t.privacy}</a>
        <a href={sitePath("/aviso-legal")} aria-current={key === "aviso-legal" ? "page" : undefined}>{t.legal}</a>
        <a href={sitePath("/cookies")} aria-current={key === "cookies" ? "page" : undefined}>{t.cookies}</a>
      </nav>}
      <article className="news-article legal-document" lang={isUnsubscribe ? language : "es"}>
        {isUnsubscribe && <p className="news-number">Barcelona Country Festival</p>}<h1 data-legal-source={document ? "" : undefined}>{title}</h1>
        {isUnsubscribe ? <><p role="status">{status}</p>{!done && <button className="news-subscribe-link" disabled={busy} onClick={unsubscribe}>{busy ? "…" : t.unsubscribe}</button>}</> : document ? <>
          <p className="legal-updated" data-legal-source><time dateTime={document.updatedAt}>{document.updatedLabel}</time></p>
          {language !== "es" && <p className="legal-language-note" lang={language}>{registrationCopy[language].spanishDocument}</p>}
          {key === "cookies" && <div className="legal-preferences"><CookiePreferencesButton language={language} /></div>}
          <nav className="legal-index" aria-label="Contenido del documento"><ol>{document.sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ol></nav>
          {document.sections.map(section => <section className="legal-section" key={section.id} id={section.id}>
            <h2 data-legal-source>{section.title}</h2>
            {section.blocks.map((block, index) => block.type === "list"
              ? <ul key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex} data-legal-source><LegalText text={item} /></li>)}</ul>
              : block.type === "heading"
                ? <h3 key={index} data-legal-source>{block.text}</h3>
                : <p key={index} data-legal-source><LegalText text={block.text} /></p>
            )}
          </section>)}
        </> : <p>{t.pending}</p>}
      </article>
    </main>
    <footer className="news-footer"><a href={sitePath("/")}>Barcelona Country Festival</a><a href="mailto:privacidad@barcelonacountryfest.com">privacidad@barcelonacountryfest.com</a><CookiePreferencesButton /></footer>
  </div>;
}
