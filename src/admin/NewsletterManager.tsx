import { useEffect, useMemo, useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";
import type { NewsletterIssue, NewsletterIssueInsert } from "../lib/database.types";

type Draft = {
  id?: string;
  issueNumber: string;
  title: string;
  excerpt: string;
  content: string;
  isPublished: boolean;
};

const emptyDraft = (issueNumber: number): Draft => ({
  issueNumber: String(issueNumber),
  title: "",
  excerpt: "",
  content: "",
  isPublished: false
});

const slugify = (value: string, issueNumber: number) => {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
  return `newsletter-${issueNumber}-${normalized || "barcelona-country"}`;
};

export function NewsletterManager({ notify }: { notify: (message: string) => void }) {
  const [issues, setIssues] = useState<NewsletterIssue[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft(1));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const nextIssueNumber = useMemo(() => Math.max(0, ...issues.map((issue) => issue.issue_number)) + 1, [issues]);

  const loadIssues = async () => {
    setIsLoading(true);
    const { data, error: loadError } = await supabase.from("newsletter_issues").select("*").order("issue_number", { ascending: false });
    if (loadError) setError(loadError.message);
    else { setIssues(data ?? []); setError(""); }
    setIsLoading(false);
  };

  useEffect(() => { void loadIssues(); }, []);

  const startNew = () => {
    setDraft(emptyDraft(nextIssueNumber));
    setError("");
  };

  const editIssue = (issue: NewsletterIssue) => {
    setDraft({
      id: issue.id,
      issueNumber: String(issue.issue_number),
      title: issue.title,
      excerpt: issue.excerpt,
      content: issue.content,
      isPublished: issue.is_published
    });
    setError("");
  };

  const saveIssue = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const issueNumber = Number.parseInt(draft.issueNumber, 10);
    if (!Number.isInteger(issueNumber) || issueNumber < 1) {
      setError("El número debe ser un entero mayor que cero.");
      return;
    }

    setIsSaving(true);
    setError("");
    const payload: NewsletterIssueInsert = {
      issue_number: issueNumber,
      slug: slugify(draft.title, issueNumber),
      title: draft.title.trim(),
      excerpt: draft.excerpt.trim(),
      content: draft.content.trim(),
      is_published: draft.isPublished,
      published_at: draft.isPublished ? new Date().toISOString() : null
    };
    const result = draft.id
      ? await supabase.from("newsletter_issues").update(payload).eq("id", draft.id)
      : await supabase.from("newsletter_issues").insert(payload);

    if (result.error) {
      setError(result.error.code === "23505" ? "Ya existe una newsletter con ese número." : result.error.message);
      setIsSaving(false);
      return;
    }

    let dispatchPending = false;
    if (draft.isPublished && issueNumber === 1) {
      const { error: dispatchError } = await supabase.functions.invoke("dispatch-welcome-newsletter");
      dispatchPending = Boolean(dispatchError);
    }
    await loadIssues();
    setDraft(emptyDraft(Math.max(nextIssueNumber, issueNumber + 1)));
    setIsSaving(false);
    notify(draft.isPublished
      ? dispatchPending ? "Newsletter publicada. El envío automático queda pendiente de configurar." : "Newsletter publicada y envíos procesados."
      : "Borrador guardado.");
  };

  return (
    <section className="newsletter-admin-panel" aria-labelledby="newsletter-admin-title">
      <header className="panel-heading">
        <div>
          <span>PUBLICACIONES</span>
          <h2 id="newsletter-admin-title">Newsletters</h2>
          <p>Crea cada número, guárdalo como borrador o publícalo en la web.</p>
        </div>
        <button className="admin-primary-button add-registration" type="button" onClick={startNew}><span aria-hidden="true">+</span> Nuevo número</button>
      </header>

      <div className="newsletter-admin-layout">
        <aside className="newsletter-issue-list" aria-label="Números de la newsletter">
          {isLoading && <p className="newsletter-admin-empty">Cargando publicaciones…</p>}
          {!isLoading && !issues.length && <p className="newsletter-admin-empty">Todavía no hay números. Empieza por la newsletter nº 1.</p>}
          {issues.map((issue) => (
            <button className={draft.id === issue.id ? "is-active" : ""} type="button" key={issue.id} onClick={() => editIssue(issue)}>
              <span>Nº {String(issue.issue_number).padStart(2, "0")}</span>
              <strong>{issue.title}</strong>
              <small className={issue.is_published ? "is-published" : ""}>{issue.is_published ? "Publicada" : "Borrador"}</small>
            </button>
          ))}
        </aside>

        <form className="newsletter-editor" onSubmit={saveIssue}>
          <div className="newsletter-editor-topline">
            <label>Número<input type="number" min="1" value={draft.issueNumber} onChange={(event) => setDraft((current) => ({ ...current, issueNumber: event.target.value }))} required /></label>
            <label className="newsletter-publish-toggle"><input type="checkbox" checked={draft.isPublished} onChange={(event) => setDraft((current) => ({ ...current, isPublished: event.target.checked }))} /><span>Publicar en la web</span></label>
          </div>
          <label>Título<input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} maxLength={180} required placeholder="Título del número" /></label>
          <label>Resumen<textarea value={draft.excerpt} onChange={(event) => setDraft((current) => ({ ...current, excerpt: event.target.value }))} maxLength={420} rows={3} placeholder="Una introducción breve para la tarjeta pública" /></label>
          <label>Contenido<textarea className="newsletter-content-editor" value={draft.content} onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))} maxLength={30000} rows={16} required placeholder="Escribe aquí el contenido completo. Los saltos de línea se conservarán." /></label>
          {error && <p className="modal-form-error" role="alert">{error}</p>}
          <footer>
            <span>{draft.id ? "Editando una publicación existente" : "Nuevo borrador"}</span>
            <button className="admin-primary-button" type="submit" disabled={isSaving}>{isSaving ? "Guardando…" : draft.isPublished ? "Guardar y publicar" : "Guardar borrador"}</button>
          </footer>
        </form>
      </div>
    </section>
  );
}
