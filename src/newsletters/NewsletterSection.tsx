import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { NewsletterIssue } from "../lib/database.types";
import "./newsletter.css";

type NewsletterLanguage = "de" | "es" | "ca" | "fr" | "en" | "it";

const copy: Record<NewsletterLanguage, { eyebrow: string; title: string; intro: string; emptyTitle: string; emptyBody: string; issue: string; read: string; close: string; subscribe: string }> = {
  de: { eyebrow: "Vom Festival", title: "Newsletters", intro: "Neuigkeiten, Künstler und Geschichten vom Weg nach Barcelona.", emptyTitle: "Die erste Ausgabe ist unterwegs", emptyBody: "Abonniere dich und erfahre als Erste:r, wann sie erscheint.", issue: "Ausgabe", read: "Lesen", close: "Schließen", subscribe: "Abonnieren" },
  es: { eyebrow: "Desde el festival", title: "Newsletters", intro: "Novedades, artistas e historias del camino hacia Barcelona.", emptyTitle: "El primer número está en camino", emptyBody: "Suscríbete y serás de los primeros en recibirlo.", issue: "Número", read: "Leer", close: "Cerrar", subscribe: "Suscribirme" },
  ca: { eyebrow: "Des del festival", title: "Newsletters", intro: "Novetats, artistes i històries del camí cap a Barcelona.", emptyTitle: "El primer número està en camí", emptyBody: "Subscriu-t'hi i seràs dels primers a rebre'l.", issue: "Número", read: "Llegir", close: "Tancar", subscribe: "Subscriu-m'hi" },
  fr: { eyebrow: "Depuis le festival", title: "Newsletters", intro: "Actualités, artistes et histoires sur la route de Barcelone.", emptyTitle: "Le premier numéro arrive", emptyBody: "Inscrivez-vous pour être parmi les premiers à le recevoir.", issue: "Numéro", read: "Lire", close: "Fermer", subscribe: "S'inscrire" },
  en: { eyebrow: "From the festival", title: "Newsletters", intro: "News, artists and stories from the road to Barcelona.", emptyTitle: "The first issue is on its way", emptyBody: "Subscribe and be among the first to receive it.", issue: "Issue", read: "Read", close: "Close", subscribe: "Subscribe" },
  it: { eyebrow: "Dal festival", title: "Newsletter", intro: "Novità, artisti e storie lungo la strada verso Barcellona.", emptyTitle: "Il primo numero è in arrivo", emptyBody: "Iscriviti per riceverlo tra i primi.", issue: "Numero", read: "Leggi", close: "Chiudi", subscribe: "Iscriviti" }
};

export function NewsletterSection({ language, onSubscribe }: { language: NewsletterLanguage; onSubscribe: () => void }) {
  const [issues, setIssues] = useState<NewsletterIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<NewsletterIssue | null>(null);
  const labels = copy[language];

  useEffect(() => {
    let active = true;
    void supabase
      .from("newsletter_issues")
      .select("*")
      .eq("is_published", true)
      .order("issue_number", { ascending: false })
      .then(({ data }) => {
        if (active) setIssues(data ?? []);
      });
    return () => { active = false; };
  }, []);

  return (
    <section id="newsletters" className="modern-newsletters modern-section" aria-labelledby="modern-newsletters-title">
      <div className="modern-newsletters-heading">
        <div>
          <p className="modern-eyebrow">{labels.eyebrow}</p>
          <h2 id="modern-newsletters-title">{labels.title}</h2>
        </div>
        <p>{labels.intro}</p>
      </div>

      {issues.length ? (
        <div className="modern-newsletter-grid">
          {issues.map((issue) => (
            <article className="modern-newsletter-card" key={issue.id}>
              <span>{labels.issue} {String(issue.issue_number).padStart(2, "0")}</span>
              <h3>{issue.title}</h3>
              <p>{issue.excerpt}</p>
              <button type="button" onClick={() => setSelectedIssue(issue)}>{labels.read} <b aria-hidden="true">↗</b></button>
            </article>
          ))}
        </div>
      ) : (
        <div className="modern-newsletter-empty">
          <span aria-hidden="true">01</span>
          <div><h3>{labels.emptyTitle}</h3><p>{labels.emptyBody}</p></div>
          <button className="modern-primary-button" type="button" onClick={onSubscribe}>{labels.subscribe} <b aria-hidden="true">↓</b></button>
        </div>
      )}

      {selectedIssue && (
        <div className="newsletter-reader-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedIssue(null);
        }}>
          <article className="newsletter-reader" role="dialog" aria-modal="true" aria-labelledby="newsletter-reader-title">
            <button className="newsletter-reader-close" type="button" onClick={() => setSelectedIssue(null)} aria-label={labels.close}>×</button>
            <span>{labels.issue} {String(selectedIssue.issue_number).padStart(2, "0")}</span>
            <h2 id="newsletter-reader-title">{selectedIssue.title}</h2>
            <p className="newsletter-reader-excerpt">{selectedIssue.excerpt}</p>
            <div className="newsletter-reader-content">{selectedIssue.content}</div>
          </article>
        </div>
      )}
    </section>
  );
}
