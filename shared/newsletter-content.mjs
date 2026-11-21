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
export function contentEmailHtml(content) {
  return parseContent(content).map(block => {
    if (block.type === 'heading') return `<h2 style="margin:34px 0 12px;font:600 28px/1.2 'Cormorant Garamond',Georgia,serif;color:#241a12">${escape(block.text)}</h2>`;
    if (block.type === 'list') return `<ul style="margin:0 0 22px;padding-left:22px">${block.items.map(item => `<li style="margin:0 0 8px">${escape(item)}</li>`).join('')}</ul>`;
    if (block.type === 'media') {
      const label = escape(block.label || 'Archivo');
      const url = escape(block.url);
      if (block.kind === 'image') return `<p style="margin:24px 0"><a href="${url}"><img src="${url}" alt="${label}" width="576" style="display:block;max-width:100%;width:100%;height:auto;border:0"></a><span style="display:block;margin-top:8px;font:italic 15px/1.4 'Cormorant Garamond',Georgia,serif;color:#6f6153">${label}</span></p>`;
      const kind = { video: 'Vídeo', audio: 'Audio', file: 'PDF' }[block.kind];
      return `<p style="margin:24px 0;padding:16px 18px;border:1px solid #d8cbb5;background:#ebe1cf"><a href="${url}" style="color:#c40000;font-weight:700">${kind}: ${label} &rarr;</a></p>`;
    }
    return `<p style="margin:0 0 20px;white-space:pre-line">${escape(block.text).replaceAll('\n', '<br>')}</p>`;
  }).join('');
}

export function contentPlainText(content) {
  return parseContent(content).map(block => block.type === 'media' ? `${block.label}: ${block.url}` : block.source).join('\n\n');
}
