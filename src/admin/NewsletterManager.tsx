import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";
import type { NewsletterIssue, NewsletterIssueInsert } from "../lib/database.types";
import { IssueBody } from "../newsletters/IssueBody";
import { NewsletterMediaTools } from "./NewsletterMediaTools";
import "../newsletters/news.css";
import "./newsletter-admin.css";
import "./admin-theme.css";

type Draft = {
  id?: string;
  issueNumber: string;
  title: string;
  excerpt: string;
  content: string;
  isPublished: boolean;
  slug?: string;
  publishedAt?: string | null;
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
  const [isUploading, setIsUploading] = useState(false);
  const [newDraftKey, setNewDraftKey] = useState(0);
  const mediaPosition = useRef(0);
  const editorBusy = isSaving || isUploading;
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [delivery, setDelivery] = useState<{ configured: boolean; from: string | null; issue_one_published: boolean; pending: number; subscribers: number; sent_by_issue: Record<string, number> } | null>(null);
  const [testTo, setTestTo] = useState("");
  const [mailBusy, setMailBusy] = useState<"" | "test" | "broadcast">("");
  const [dispatching, setDispatching] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");

  const deliveryRequest = async (action: "status" | "dispatch" | "test" | "broadcast", extra: Record<string, string> = {}) => {
    const { data } = await supabase.auth.getSession();
    if (!testTo && data.session?.user.email) setTestTo(data.session.user.email);
    const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` }, body: JSON.stringify({ action, ...extra }) });
    if (!response.ok) throw new Error("No se ha podido consultar o procesar el envío. Revisa la configuración del servidor.");
    return response.json();
  };
  const sendTest = async () => {
    if (!draft.id) return;
    setMailBusy("test"); setDeliveryError("");
    try { await deliveryRequest("test", { issue_id: draft.id, to: testTo.trim() }); notify(`Prueba enviada a ${testTo.trim()}.`); }
    catch { setDeliveryError("No se pudo enviar la prueba. Comprueba la dirección y la configuración del correo."); }
    finally { setMailBusy(""); }
  };
  const broadcast = async () => {
    if (!draft.id || !delivery) return;
    const left = delivery.subscribers - (delivery.sent_by_issue[draft.id] ?? 0);
    if (!window.confirm(`Se enviará «${draft.title}» a ${left} suscriptores. Cada persona lo recibe una sola vez. ¿Continuar?`)) return;
    setMailBusy("broadcast"); setDeliveryError("");
    let sent = 0;
    try {
      for (let guard = 0; guard < 100; guard++) { // 100 per call; the server skips anyone already sent
        const result = await deliveryRequest("broadcast", { issue_id: draft.id });
        sent += result.sent;
        if (!result.remaining || !result.sent) break;
      }
      notify(`${sent} correos enviados.`);
    } catch { setDeliveryError(`El envío se ha interrumpido tras ${sent} correos. Vuelve a pulsar para continuar: nadie lo recibirá dos veces.`); }
    finally { setMailBusy(""); await loadDelivery(); }
  };
  const loadDelivery = async () => {
    try { setDelivery(await deliveryRequest("status")); setDeliveryError(""); }
    catch { setDeliveryError("No se pudo consultar el estado de los envíos."); }
  };
  const dispatch = async () => {
    setDispatching(true); setDeliveryError("");
    try { const result = await deliveryRequest("dispatch"); notify(`${result.sent} correos enviados. Pendientes: ${result.pending}.`); await loadDelivery(); }
    catch { setDeliveryError("El envío no se ha completado. Los pendientes se conservan para reintentarlo."); }
    finally { setDispatching(false); }
  };

  const nextIssueNumber = useMemo(() => Math.max(0, ...issues.map((issue) => issue.issue_number)) + 1, [issues]);

  const loadIssues = async () => {
    setIsLoading(true);
    const { data, error: loadError } = await supabase.from("newsletter_issues").select("*").order("issue_number", { ascending: false });
    if (loadError) setError(loadError.message);
    else { setIssues(data ?? []); setError(""); }
    setIsLoading(false);
  };

  useEffect(() => { void loadIssues(); void loadDelivery(); }, []);

  const startNew = () => {
    setDraft(emptyDraft(nextIssueNumber));
    setNewDraftKey(value => value + 1);
    mediaPosition.current = 0;
    setError("");
  };

  const editIssue = (issue: NewsletterIssue) => {
    mediaPosition.current = issue.content.length;
    setDraft({
      id: issue.id,
      issueNumber: String(issue.issue_number),
      title: issue.title,
      excerpt: issue.excerpt,
      content: issue.content,
      isPublished: issue.is_published,
      slug: issue.slug,
      publishedAt: issue.published_at
    });
    setError("");
  };

  const saveIssue = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editorBusy) return;
    const issueNumber = Number(draft.issueNumber);
    if (!Number.isInteger(issueNumber) || issueNumber < 1) {
      setError("El número debe ser un entero mayor que cero.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
    const payload: NewsletterIssueInsert = {
      issue_number: issueNumber,
      slug: draft.slug ?? slugify(draft.title, issueNumber),
      title: draft.title.trim(),
      excerpt: draft.excerpt.trim(),
      content: draft.content.trim(),
      is_published: draft.isPublished,
      published_at: draft.isPublished ? draft.publishedAt ?? new Date().toISOString() : null
    };
    const result = draft.id
      ? await supabase.from("newsletter_issues").update(payload).eq("id", draft.id).select().single()
      : await supabase.from("newsletter_issues").insert(payload).select().single();

    if (result.error) {
      setError(result.error.code === "23505" ? "Ya existe una newsletter con ese número." : result.error.message);
      setIsSaving(false);
      return;
    }

    await loadIssues();
    if (result.data) editIssue(result.data);
    await loadDelivery();
    notify(draft.isPublished ? "Número publicado en el blog." : "Borrador guardado.");
    } catch { setError("No se ha podido guardar. Tu contenido sigue en el editor para volver a intentarlo."); }
    finally { setIsSaving(false); }
  };

  return (
    <section className="newsletter-admin-panel" aria-labelledby="newsletter-admin-title">
      <header className="panel-heading">
        <div>
          <span>PUBLICACIONES</span>
          <h2 id="newsletter-admin-title">Barcelona Country News</h2>
          <p>Cada número se publica en el blog. El nº 1 se envía a las nuevas suscripciones cuando el correo esté configurado.</p>
        </div>
        <button className="admin-primary-button add-registration" type="button" disabled={editorBusy} onClick={startNew}><span aria-hidden="true">+</span> Nuevo número</button>
      </header>

      <div className="newsletter-delivery-status" role="status">
        <div><strong>{delivery?.configured ? `Remitente: ${delivery.from}` : "Envío por correo pendiente de configuración"}</strong><p>{delivery?.issue_one_published ? "El número 1 está publicado." : "El primer número está pendiente de contenido y publicación."} {delivery ? `${delivery.subscribers} suscriptores con consentimiento. Pendientes de bienvenida: ${delivery.pending}.` : ""}</p>{deliveryError && <p>{deliveryError}</p>}</div>
        <button type="button" className="admin-primary-button" disabled={!delivery?.configured || !delivery.issue_one_published || !delivery.pending || dispatching} onClick={dispatch}>{dispatching ? "Enviando…" : "Enviar hasta 10 pendientes"}</button>
      </div>

      <div className="newsletter-admin-layout">
        <aside className="newsletter-issue-list" aria-label="Números de la newsletter">
          {isLoading && <p className="newsletter-admin-empty">Cargando publicaciones…</p>}
          {!isLoading && !issues.length && <p className="newsletter-admin-empty">Todavía no hay números. Empieza por la newsletter nº 1.</p>}
          {issues.map((issue) => (
            <button disabled={editorBusy} className={draft.id === issue.id ? "is-active" : ""} type="button" key={issue.id} onClick={() => editIssue(issue)}>
              <span>Nº {String(issue.issue_number).padStart(2, "0")}</span>
              <strong>{issue.title}</strong>
              <small className={issue.is_published ? "is-published" : ""}>{issue.is_published ? "Publicada" : "Borrador"}</small>
            </button>
          ))}
        </aside>

        <form className="newsletter-editor" onSubmit={saveIssue}>
          <fieldset disabled={editorBusy} className="newsletter-editor-fields">
          <div className="newsletter-editor-topline">
            <label>Número<input type="number" min="1" value={draft.issueNumber} onChange={(event) => setDraft((current) => ({ ...current, issueNumber: event.target.value }))} required /></label>
            <label className="newsletter-publish-toggle"><input type="checkbox" checked={draft.isPublished} onChange={(event) => setDraft((current) => ({ ...current, isPublished: event.target.checked }))} /><span>Publicar en la web</span></label>
          </div>
          <label>Título<input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} maxLength={180} required placeholder="Título del número" /></label>
          <label>Resumen<textarea value={draft.excerpt} onChange={(event) => setDraft((current) => ({ ...current, excerpt: event.target.value }))} maxLength={420} rows={3} placeholder="Una introducción breve para la tarjeta pública" /></label>
          <label>Contenido<textarea className="newsletter-content-editor" value={draft.content} onSelect={event => { mediaPosition.current = event.currentTarget.selectionStart; }} onChange={(event) => { mediaPosition.current = event.target.selectionStart; setDraft((current) => ({ ...current, content: event.target.value })); }} maxLength={30000} rows={12} required placeholder="Párrafos separados por una línea en blanco. Usa ## para un subtítulo y - para una lista. Los archivos se insertan con el apartado Multimedia." /></label>
          </fieldset>
          <NewsletterMediaTools key={draft.id ?? `new-${newDraftKey}`} content={draft.content} onChange={content => setDraft(current => ({ ...current, content }))} position={mediaPosition} disabled={editorBusy} onBusy={setIsUploading} />
          <button className="newsletter-preview-toggle" type="button" aria-expanded={preview} onClick={() => setPreview(value => !value)}>{preview ? "Ocultar vista previa" : "Ver diseño antes de publicar"}</button>
          {preview && <article className="news-article newsletter-preview"><p className="news-number">Nº {draft.issueNumber}</p><h2>{draft.title || "Título de la publicación"}</h2><p className="news-excerpt">{draft.excerpt}</p><IssueBody content={draft.content} /></article>}
          {draft.id && (
            <fieldset className="newsletter-mailing" disabled={!delivery?.configured || !!mailBusy || editorBusy}>
              <legend>Envío por correo</legend>
              <p>{!delivery?.configured ? "El remitente todavía no está configurado." : `Enviado a ${delivery.sent_by_issue[draft.id] ?? 0} de ${delivery.subscribers} suscriptores. Guarda los cambios antes de enviar.`}</p>
              <div className="newsletter-mailing-row">
                <label>Correo de prueba<input type="email" value={testTo} onChange={(event) => setTestTo(event.target.value)} placeholder="tu@correo.com" /></label>
                <button type="button" className="admin-secondary-button" disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testTo.trim())} onClick={sendTest}>{mailBusy === "test" ? "Enviando…" : "Enviar prueba"}</button>
              </div>
              <button type="button" className="admin-primary-button" disabled={!draft.isPublished || !delivery || (delivery.sent_by_issue[draft.id] ?? 0) >= delivery.subscribers} onClick={broadcast}>{mailBusy === "broadcast" ? "Enviando…" : draft.isPublished ? "Enviar a los suscriptores" : "Publica el número para enviarlo"}</button>
            </fieldset>
          )}
          {error && <p className="modal-form-error" role="alert">{error}</p>}
          <footer>
            <span>{draft.slug && draft.isPublished ? <a href={`/newsletters/${draft.slug}`} target="_blank" rel="noreferrer">Ver en el blog ↗</a> : "Borrador privado"}</span>
            <button className="admin-primary-button" type="submit" disabled={editorBusy}>{isUploading ? "Subiendo archivos…" : isSaving ? "Guardando…" : draft.isPublished ? "Guardar y publicar" : "Guardar borrador"}</button>
          </footer>
        </form>
      </div>
    </section>
  );
}
