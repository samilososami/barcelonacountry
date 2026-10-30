// React escapes all content. Editorial HTML is never executed.
export function IssueBody({ content }: { content: string }) {
  return <div className="news-article-body">{content.split(/\n\s*\n/).filter(Boolean).map((block, i) => {
    if (block.startsWith("## ")) return <h2 key={i}>{block.slice(3)}</h2>;
    if (block.split("\n").every(line => line.startsWith("- "))) return <ul key={i}>{block.split("\n").map((line, j) => <li key={j}>{line.slice(2)}</li>)}</ul>;
    return <p key={i}>{block}</p>;
  })}</div>;
}
