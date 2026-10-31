import { parseContent } from "../../shared/newsletter-content.mjs";

// React escapes all text and the shared parser only accepts HTTPS media URLs.
export function IssueBody({ content }: { content: string }) {
  return <div className="news-article-body">{parseContent(content).map((block, i) => {
    if (block.type === "heading") return <h2 key={i}>{block.text}</h2>;
    if (block.type === "list") return <ul key={i}>{block.items.map((line, j) => <li key={j}>{line}</li>)}</ul>;
    if (block.type === "media") return <figure className={`news-media news-media-${block.kind}`} key={`${i}-${block.url}`}>
      {block.kind === "image" ? <a href={block.url} target="_blank" rel="noopener noreferrer"><img src={block.url} alt={block.label} loading="lazy" decoding="async" /></a>
        : block.kind === "video" ? <video src={block.url} controls playsInline preload="metadata" aria-label={block.label} />
        : block.kind === "audio" ? <audio src={block.url} controls preload="none" aria-label={block.label} />
        : <a className="news-file-link" href={block.url} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">PDF</span>{block.label || "Abrir documento"}</a>}
      {block.kind !== "file" && <figcaption>{block.label} {block.kind !== "image" && <a href={block.url} target="_blank" rel="noopener noreferrer">Abrir archivo</a>}</figcaption>}
    </figure>;
    return <p key={i}>{block.text}</p>;
  })}</div>;
}
