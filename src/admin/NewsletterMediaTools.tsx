import { useState, type RefObject, type ChangeEvent } from "react";
import { supabase } from "../lib/supabase";
import { CONTENT_LIMIT, MEDIA_ACCEPT, MEDIA_BUCKET, insertMedia, mediaMarkup, parseContent, validateMediaFile } from "../../shared/newsletter-content.mjs";

type Props = {
  content: string;
  onChange: (content: string) => void;
  position: RefObject<number>;
  disabled: boolean;
  onBusy: (busy: boolean) => void;
};

export function NewsletterMediaTools({ content, onChange, position, disabled, onBusy }: Props) {
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const blocks = parseContent(content);
  const media = blocks.flatMap((block, index) => block.type === "media" ? [{ ...block, index }] : []);

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    setError("");
    if (files.length > 8) { setError("Selecciona como máximo 8 archivos por tanda."); return; }
    onBusy(true);
    let completed = 0;
    let nextContent = content;
    let cursor = position.current;
    try {
      setProgress("Comprobando archivos…");
      const specs = await Promise.all(files.map(file => validateMediaFile(file)));
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || !data.user) throw new Error("Tu sesión ha caducado. Inicia sesión de nuevo antes de subir archivos.");
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const spec = specs[i];
        setProgress(`Subiendo ${i + 1} de ${files.length}: ${file.name}`);
        const path = `${data.user.id}/${crypto.randomUUID()}.${spec.extension}`;
        const { data: location } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
        const markup = mediaMarkup(spec.kind, file.name, location.publicUrl);
        // Check the content limit before transferring a file that cannot be inserted.
        const inserted = insertMedia(nextContent, cursor, markup);
        const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, { contentType: file.type, cacheControl: "3600", upsert: false });
        if (uploadError) throw new Error(`No se pudo subir «${file.name}». Comprueba la conexión y los permisos; puedes volver a seleccionarlo.`);
        nextContent = inserted.content;
        cursor = inserted.cursor;
        onChange(nextContent);
        position.current = cursor;
        completed++;
      }
      setProgress(`${completed} ${completed === 1 ? "archivo insertado" : "archivos insertados"}. Guarda el número para conservar los cambios.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo subir el archivo.");
      setProgress(completed ? `${completed} archivos ya insertados; los demás no se han añadido.` : "");
    } finally { onBusy(false); }
  };

  const replaceBlock = (index: number, source: string | null) => {
    const updated = blocks.flatMap((block, i) => i === index ? source === null ? [] : [source] : [block.source]).join("\n\n");
    if (updated.length > CONTENT_LIMIT) { setError("El contenido admite hasta 30.000 caracteres."); return; }
    onChange(updated);
    position.current = updated.length;
  };

  return <section className="newsletter-media-tools" aria-labelledby="newsletter-media-title">
    <header><div><h3 id="newsletter-media-title">Multimedia</h3><p>Coloca el cursor entre dos párrafos y sube un archivo para insertarlo ahí. Sin seleccionar una posición, se añade al final.</p></div><span>FOTOS · GIF · VÍDEO · AUDIO · PDF</span></header>
    <label className="newsletter-upload">Subir archivos multimedia<input type="file" accept={MEDIA_ACCEPT} multiple disabled={disabled} onChange={upload} aria-describedby="newsletter-media-help" /></label>
    <p id="newsletter-media-help" className="newsletter-media-help">JPG, PNG, GIF, WebP y PDF: hasta 5 MB. MP4, WebM, MP3, M4A, OGG y WAV: hasta 25 MB. Los archivos tienen un enlace público desde que se suben; no incluyas información privada.</p>
    <p className="newsletter-media-help">En la web se reproducen vídeos y audio. En el correo se muestran las imágenes y GIF, y enlaces a los demás archivos. Quitar un bloque no borra el archivo de correos o publicaciones anteriores.</p>
    {progress && <p className="newsletter-upload-status" role="status">{progress}</p>}
    {error && <p className="modal-form-error" role="alert">{error}</p>}
    {!!media.length && <ol className="newsletter-media-list" aria-label="Archivos del número">{media.map((block, ordinal) => <li key={`${block.index}-${block.url}`}>
      {block.kind === "image" ? <img src={block.url} alt="" loading="lazy" /> : <span className="newsletter-media-type">{{ video: "VÍDEO", audio: "AUDIO", file: "PDF" }[block.kind]}</span>}
      <label>Descripción del archivo {ordinal + 1}<input value={block.label} maxLength={180} disabled={disabled} onChange={event => replaceBlock(block.index, mediaMarkup(block.kind, event.target.value, block.url))} /></label>
      <a href={block.url} target="_blank" rel="noopener noreferrer">Abrir</a>
      <button type="button" disabled={disabled} onClick={() => replaceBlock(block.index, null)} aria-label={`Quitar ${block.label} del contenido`}>Quitar</button>
    </li>)}</ol>}
  </section>;
}
