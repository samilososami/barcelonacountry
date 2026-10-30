import { useEffect, useState } from "react";
import { newsCopy, type NewsLanguage } from "./copy";
import { ArrowIcon } from "../components/ArrowIcon";
import "./news.css";

// Replace null only when the organisation supplies the approved full documents.
export const legalDocuments: Record<string, string | null> = { privacidad: null, "aviso-legal": null, cookies: null };

export function LegalPage({ language }: { language: NewsLanguage }) {
  const t = newsCopy[language];
  const key = window.location.pathname.slice(1);
  const isUnsubscribe = key === "baja";
  const title = isUnsubscribe ? t.unsubscribe : key === "cookies" ? t.cookies : key === "aviso-legal" ? t.legal : t.privacy;
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => { document.title = `${title} | Barcelona Country Fest`; document.documentElement.lang = language; }, [title, language]);
  async function unsubscribe() {
    setBusy(true);
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "unsubscribe", token: new URLSearchParams(window.location.search).get("token") }) });
      if (!response.ok) throw new Error();
      setStatus(t.unsubscribed); setDone(true);
    } catch { setStatus(t.retry); }
    finally { setBusy(false); }
  }
  return <div className="modern-page news-page"><header className="news-header"><a href="/"><img src="/assets/logo-primary-senyera.png" alt="Barcelona Country Fest" /></a><a href="/"><ArrowIcon direction="left" /> {t.back}</a></header><main className="news-main"><article className="news-article legal-document"><p className="news-number">Barcelona Country Fest</p><h1>{title}</h1>{isUnsubscribe ? <><p role="status">{status}</p>{!done && <button className="news-subscribe-link" disabled={busy} onClick={unsubscribe}>{busy ? "…" : t.unsubscribe}</button>}</> : <p>{legalDocuments[key] ?? t.pending}</p>}</article></main></div>;
}
