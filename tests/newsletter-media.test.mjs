import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTENT_LIMIT, contentEmailHtml, contentPlainText, insertMedia, mediaMarkup, parseContent, safeMediaUrl, validateMediaFile } from '../shared/newsletter-content.mjs';
import { welcomeEmail } from '../server/newsletter.mjs';

test('existing paragraphs, headings and lists retain their format', () => {
  assert.deepEqual(parseContent('Texto\ncon salto\n\n## Título\n\n- Uno\n- Dos').map(b => b.type), ['paragraph', 'heading', 'list']);
  assert.match(contentEmailHtml("- Uno\n- Dos"), /<ul[^>]*><li[^>]*>[^<]*<span[^>]*>&#9733;<\/span>[^<]*Uno<\/li><li[^>]*>.*Dos<\/li><\/ul>/);
});

test('all media types round-trip with readable captions and safe URLs', () => {
  for (const kind of ['image', 'video', 'audio', 'file']) {
    const markup = mediaMarkup(kind, 'Pista [Barcelona]\n2027', 'https://example.com/festival(1)?a=1&b=2');
    const [parsed] = parseContent(markup);
    assert.equal(parsed.type, 'media'); assert.equal(parsed.kind, kind);
    assert.equal(parsed.label, 'Pista  Barcelona  2027');
    assert.equal(parsed.url, 'https://example.com/festival%281%29?a=1&b=2');
    assert.match(contentPlainText(markup), /^Pista.*https:\/\//);
  }
});

test('editor inserts between paragraphs without deleting text, and enforces limits', () => {
  const first = insertMedia('Antes\n\nDespués', 5, '![Foto](https://example.com/a.png)');
  assert.equal(first.content, 'Antes\n\n![Foto](https://example.com/a.png)\n\nDespués');
  const next = insertMedia(first.content, first.cursor, '@audio[Audio](https://example.com/a.mp3)');
  assert.deepEqual(parseContent(next.content).map(b => b.type), ['paragraph','media','media','paragraph']);
  assert.throws(() => insertMedia('a'.repeat(CONTENT_LIMIT), CONTENT_LIMIT, 'extra'), /30.000/);
});

test('caption editing preserves spaces while typing and can clear the field', () => {
  for (const caption of ['', 'Fiesta ', 'Fiesta country ']) {
    assert.equal(parseContent(mediaMarkup('image', caption, 'https://example.com/a.png'))[0].label, caption);
  }
});

test('unsafe URLs and raw HTML never become executable media or markup', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,<script>', '//example.com/a', 'http://example.com/a', 'https://user:pass@example.com/a']) {
    assert.equal(safeMediaUrl(url), null);
    assert.equal(parseContent(`![x](${url})`)[0].type, 'paragraph');
  }
  const html = contentEmailHtml('<script>alert(1)</script>\n\n![" onerror="alert(1)](https://example.com/photo.png)');
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('alt="" onerror='));
  assert.match(html, /&quot; onerror=&quot;/);
});

test('email embeds GIF without flattening and links video, audio and PDF', () => {
  const content = [mediaMarkup('image', 'Baile', 'https://example.com/dance.gif'),mediaMarkup('video', 'Video', 'https://example.com/v.mp4'),mediaMarkup('audio', 'Audio', 'https://example.com/a.mp3'),mediaMarkup('file', 'Programa', 'https://example.com/p.pdf')].join('\n\n');
  const mail = welcomeEmail({ id: 'qa', email: 'test@example.invalid', full_name: 'QA' }, { slug: 'test', title: 'QA', content }, 'test-secret', 'sender@example.invalid');
  assert.match(mail.html, /<img src="https:\/\/example.com\/dance.gif"/);
  assert.ok(!mail.html.includes('<video')); assert.ok(!mail.html.includes('<audio'));
  for (const file of ['v.mp4','a.mp3','p.pdf']) assert.ok(mail.html.includes(`href="https://example.com/${file}"`));
  assert.ok(mail.text.includes('Baile: https://example.com/dance.gif')); assert.ok(!mail.text.includes('@video['));
});

test('upload accepts known signatures and rejects unsupported or disguised formats', async () => {
  for (const [mime, bytes] of [
    ['image/png', [137,80,78,71,13,10,26,10]], ['image/jpeg', [255,216,255]],
    ['image/gif', 'GIF89a'], ['image/webp', 'RIFF1234WEBP'],
    ['video/mp4', '0000ftypisom'], ['video/webm', [26,69,223,163]],
    ['audio/mpeg', 'ID3'], ['audio/mp4', '0000ftypM4A '],
    ['audio/ogg', 'OggS'], ['audio/wav', 'RIFF1234WAVE'], ['application/pdf', '%PDF-1.4']
  ]) {
    const file = new File([typeof bytes === 'string' ? bytes : new Uint8Array(bytes)], 'test', { type: mime });
    assert.ok((await validateMediaFile(file)).extension);
  }
  await assert.rejects(validateMediaFile(new File(['<svg/>'], 'x.svg', { type:'image/svg+xml' })), /Formato no admitido/);
  await assert.rejects(validateMediaFile(new File(['<html>'], 'x.png', { type:'image/png' })), /no coincide/);
  await assert.rejects(validateMediaFile(new File([], 'empty.gif', { type:'image/gif' })), /entre 1 byte/);
  await assert.rejects(validateMediaFile({ type:'image/png', size:5*1024*1024+1 }), /5 MB/);
  await assert.rejects(validateMediaFile({ type:'video/mp4', size:25*1024*1024+1 }), /25 MB/);
});
