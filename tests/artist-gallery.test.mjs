import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const main = await readFile(new URL('../src/main.tsx', import.meta.url), 'utf8');
const gallery = await readFile(new URL('../src/components/ArtistGalleryDialog.tsx', import.meta.url), 'utf8');
const contact = await readFile(new URL('../src/components/ContactDialog.tsx', import.meta.url), 'utf8');
const refinement = await readFile(new URL('../src/lib/refinement-copy.ts', import.meta.url), 'utf8');

test('every artist has an individual gallery backed by real local assets', async () => {
  const order = main.match(/const artistDisplayOrder = \[([\s\S]*?)\] as const;/)?.[1];
  const mapping = main.match(/const artistGalleryImages:[\s\S]*?= \{([\s\S]*?)\n\};/)?.[1];
  assert.ok(order, 'artistDisplayOrder must remain explicit');
  assert.ok(mapping, 'artistGalleryImages must remain explicit');

  const artists = [...order.matchAll(/"([^"]+)"/g)].map(match => match[1]);
  for (const artist of artists) {
    assert.ok(mapping.includes(`"${artist}": [`), `${artist} must have an individual gallery`);
  }

  const assets = [...mapping.matchAll(/"(\/assets\/[^"]+)"/g)].map(match => match[1]);
  assert.ok(assets.length >= artists.length, 'each gallery needs at least one image');
  for (const asset of assets) {
    const path = `${root}public${asset}`;
    await access(path);
    assert.ok((await stat(path)).size > 10_000, `${asset} must be a real image`);
  }
});

test('gallery access lives on each artist card and the old coming-soon controls are gone', () => {
  assert.match(main, /className="c-artist-gallery-button"/);
  assert.doesNotMatch(main, /<small>\{galleryImages\.length\}<\/small>/);
  assert.doesNotMatch(main, /artist-gallery-preview|c-gallery-preview|c-stat-gallery/);
  assert.doesNotMatch(main, /refinement\.soon/);
});

test('David Prestor gallery contains every photo supplied in the new Drive folder', () => {
  const block = main.match(/"David Prestor": \[([\s\S]*?)\n  \],/)?.[1];
  assert.ok(block, 'David Prestor must keep an explicit gallery');
  const photos = [...block.matchAll(/"(\/assets\/[^\"]+)"/g)].map(match => match[1]);
  assert.equal(photos.length, 10, 'official portrait plus nine Drive photos');
});

test('the gallery dialog supports close, previous, next and thumbnail selection', () => {
  assert.match(gallery, /ArrowLeft/);
  assert.match(gallery, /ArrowRight/);
  assert.match(gallery, /c-artist-gallery-thumbnails/);
  assert.match(gallery, /onCancel=\{onClose\}/);
});

test('contact no longer exposes temporary or preview-only copy', () => {
  const source = `${contact}\n${refinement}`;
  assert.doesNotMatch(source, /Formulario de prueba|Formulari de prova|Preview form|Formulaire de démonstration|Modulo di prova|Testformular/);
  assert.doesNotMatch(source, /consultas todavía no está habilitado|Your message has not been sent|Encara no s’ha enviat|n’a pas encore été envoyé|non è ancora stato inviato|nicht gesendet/);
  assert.doesNotMatch(contact, /c-preview-note|contact-preview-note/);
});
