// A small, shared editorial format. Never interpret arbitrary HTML.
export const MEDIA_BUCKET = 'newsletter-media';
export const CONTENT_LIMIT = 30000;
export const MEDIA_TYPES = {
  'image/jpeg': ['image', 'jpg'], 'image/png': ['image', 'png'],
  'image/gif': ['image', 'gif'], 'image/webp': ['image', 'webp'],
  'video/mp4': ['video', 'mp4'], 'video/webm': ['video', 'webm'],
  'audio/mpeg': ['audio', 'mp3'], 'audio/mp4': ['audio', 'm4a'],
  'audio/ogg': ['audio', 'ogg'], 'audio/wav': ['audio', 'wav'],
  'application/pdf': ['file', 'pdf']
};
export const MEDIA_ACCEPT = Object.keys(MEDIA_TYPES).join(',');

export function safeMediaUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export function mediaMarkup(kind, label, url) {
  const safeUrl = safeMediaUrl(url);
  if (!safeUrl || !['image', 'video', 'audio', 'file'].includes(kind)) throw new Error('Archivo no válido.');
  const safeLabel = label.replace(/[\[\]\r\n]/g, ' ').slice(0, 180);
  return `${kind === 'image' ? '!' : `@${kind}`}[${safeLabel}](${safeUrl.replaceAll('(', '%28').replaceAll(')', '%29')})`;
}

export function parseContent(content) {
  return content.replaceAll('\r\n', '\n').split(/\n\s*\n/).filter(block => block.trim()).map(source => {
    const media = source.trim().match(/^(!|@video|@audio|@file)\[([^\]\n]*)\]\(([^\s]+)\)$/);
    const url = media && safeMediaUrl(media[3]);
    if (media && url) return { type: 'media', kind: media[1] === '!' ? 'image' : media[1].slice(1), label: media[2], url, source };
    if (source.startsWith('## ')) return { type: 'heading', text: source.slice(3), source };
    if (source.split('\n').every(line => line.startsWith('- '))) return { type: 'list', items: source.split('\n').map(line => line.slice(2)), source };
    return { type: 'paragraph', text: source, source };
  });
}

export function insertMedia(content, position, markup) {
  const at = Math.max(0, Math.min(position, content.length));
  const before = content.slice(0, at).trimEnd();
  const after = content.slice(at).trimStart();
  const result = [before, markup, after].filter(Boolean).join('\n\n');
  if (result.length > CONTENT_LIMIT) throw new Error('No cabe el archivo: el contenido admite hasta 30.000 caracteres.');
  return { content: result, cursor: (before ? before.length + 2 : 0) + markup.length + 2 };
}

export async function validateMediaFile(file) {
  const spec = Object.hasOwn(MEDIA_TYPES, file.type) ? MEDIA_TYPES[file.type] : undefined;
  if (!spec) throw new Error('Formato no admitido. Usa JPG, PNG, GIF, WebP, MP4, WebM, MP3, M4A, OGG, WAV o PDF.');
  const [kind, extension] = spec;
  const limit = kind === 'video' || kind === 'audio' ? 25 : 5;
  if (!file.size || file.size > limit * 1024 * 1024) throw new Error(`El archivo debe ocupar entre 1 byte y ${limit} MB.`);
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const ascii = (start, end) => String.fromCharCode(...bytes.slice(start, end));
  const starts = (...values) => values.every((value, index) => bytes[index] === value);
  const valid = {
    'image/jpeg': starts(255, 216, 255),
    'image/png': starts(137, 80, 78, 71, 13, 10, 26, 10),
    'image/gif': ['GIF87a', 'GIF89a'].includes(ascii(0, 6)),
    'image/webp': ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP',
    'video/mp4': ascii(4, 8) === 'ftyp',
    'video/webm': starts(26, 69, 223, 163),
    'audio/mpeg': ascii(0, 3) === 'ID3' || (bytes[0] === 255 && (bytes[1] & 224) === 224),
    'audio/mp4': ascii(4, 8) === 'ftyp',
    'audio/ogg': ascii(0, 4) === 'OggS',
    'audio/wav': ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WAVE',
    'application/pdf': ascii(0, 5) === '%PDF-'
  }[file.type];
  if (!valid) throw new Error('El contenido del archivo no coincide con su formato. Exporta una copia válida e inténtalo de nuevo.');
  return { kind, extension };
}

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
// **bold**, *italic* and ***both***, applied after escaping so no markup can be smuggled in.
const marks = html => html
  .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#10100f">$1</strong>')
  .replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
export const stripMarks = text => String(text).replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1');
// Email body for an issue, in the festival's look: serif headings with a red star, star-ruled lists,
// framed photos with a red caption rule, and dark "ticket" cards for video, audio and PDF (mail clients
// cannot play media). Inline styles only. `assets` is the absolute URL of /assets/email on the site.
export function contentEmailHtml(content, { assets = 'https://www.barcelonacountry.com/assets/email' } = {}) {
  const SERIF = "'Cormorant Garamond',Georgia,'Times New Roman',serif";
  const SANS = "'Manrope','Helvetica Neue',Helvetica,Arial,sans-serif";
  const card = (url, kicker, label, icon) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0"><tr><td bgcolor="#10100f" style="background:#10100f;border-radius:6px;padding:18px 20px"><a href="${url}" style="text-decoration:none;color:#f2f1eb"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="64" style="padding-right:18px;vertical-align:middle">${icon}</td><td style="vertical-align:middle"><span style="display:block;font:700 10px/1.4 ${SANS};letter-spacing:.28em;text-transform:uppercase;color:#ff5b55">${kicker}</span><span style="display:block;margin-top:4px;font:500 23px/1.15 ${SERIF};color:#f2f1eb">${label}</span></td></tr></table></a></td></tr></table>`;
  const disc = (text) => `<span style="display:inline-block;width:52px;height:52px;line-height:52px;border-radius:26px;background:#c40000;color:#ffffff;text-align:center;font:800 12px/52px ${SANS};letter-spacing:.1em">${text}</span>`;
  return parseContent(content).map(block => {
    if (block.type === 'heading') return `<h2 style="margin:38px 0 14px;font:500 31px/1.12 ${SERIF};color:#10100f"><span style="color:#c40000;font-size:15px;vertical-align:middle">&#9733;</span>&nbsp; ${marks(escape(block.text))}</h2>`;
    if (block.type === 'list') return `<ul style="margin:0 0 26px;padding:0;list-style:none;border-top:1px solid #d9d6cc">${block.items.map(item => `<li style="margin:0;padding:12px 0 12px 26px;border-bottom:1px solid #d9d6cc;text-indent:-26px"><span style="color:#c40000;font-size:11px">&#9733;</span>&nbsp;&nbsp;&nbsp;${marks(escape(item))}</li>`).join('')}</ul>`;
    if (block.type === 'media') {
      const label = escape(block.label || 'Archivo');
      const url = escape(block.url);
      if (block.kind === 'image') return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:30px 0"><tr><td><a href="${url}"><img src="${url}" alt="${label}" width="512" style="display:block;width:100%;max-width:100%;height:auto;border:0;border-radius:6px"></a></td></tr>${block.label ? `<tr><td style="padding:12px 0 0 14px;border-left:2px solid #c40000;font:italic 500 17px/1.35 ${SERIF};color:#5f5a52">${label}</td></tr>` : ''}</table>`;
      if (block.kind === 'video') return card(url, 'Vídeo', label, `<img src="${assets}/play.png" width="52" height="52" alt="" style="display:block;border:0">`);
      if (block.kind === 'audio') return card(url, 'Audio', label, disc('&#9835;'));
      return card(url, 'PDF', label, disc('PDF'));
    }
    return `<p style="margin:0 0 20px;white-space:pre-line">${marks(escape(block.text)).replaceAll('\n', '<br>')}</p>`;
  }).join('');
}

export function contentPlainText(content) {
  return parseContent(content).map(block => block.type === 'media' ? `${block.label}: ${block.url}` : stripMarks(block.source)).join('\n\n');
}
