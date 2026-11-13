import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const main = await readFile(new URL('../src/main.tsx', import.meta.url), 'utf8');

test('the announced choreographers keep the client-approved order', () => {
  const source = main.match(/const artistDisplayOrder = \[([\s\S]*?)\] as const;/)?.[1];
  assert.ok(source, 'artistDisplayOrder must remain explicit');
  const names = [...source.matchAll(/"([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(names.slice(0, 13), [
    'Pol F. Ryan',
    'Algaly Fofana',
    'David Villellas',
    'Sofía Balzano',
    'Montse Moscardó',
    'Johnny',
    'David Prestor',
    'Laura Jones',
    'Silvia Denise',
    'Virginie Barjaud',
    'Silvia Calsina',
    'Neus Lloveras',
    'Edu Roldos'
  ]);
});

test('every newly announced artist uses a real supplied photo', async () => {
  const suppliedPhotos = [
    ['Laura Jones', 'artist-laura-jones.jpg'],
    ['Silvia Denise', 'artist-silvia-denise.jpg'],
    ['Virginie Barjaud', 'artist-virginie-barjaud.jpg'],
    ['Silvia Calsina', 'artist-silvia-calsina.jpg'],
    ['Neus Lloveras', 'artist-neus-lloveras.jpg'],
    ['Edu Roldos', 'artist-edu-roldos.webp'],
    ['DJ Lu', 'artist-dj-lu.jpg'],
    ['Antoine', 'artist-antoine.jpg']
  ];

  for (const [artist, filename] of suppliedPhotos) {
    assert.ok(main.includes(`"${artist}": "/assets/${filename}"`), `${artist} must use ${filename}`);
    const path = `${root}public/assets/${filename}`;
    await access(path);
    assert.ok((await stat(path)).size > 10_000, `${filename} must not be an empty placeholder`);
  }
});

test('the question-mark discovery card is not rendered or counted', () => {
  assert.doesNotMatch(main, /<article className="c-artist c-mystery"/);
  assert.match(main, /const artistCardTotal = artists\.length;/);
});

test('the published artist total follows the complete lineup', () => {
  assert.match(main, /const festivalStatValues = \{ artists: "\+17", dancers: "\+3000" \};/);
});

test('Laura Jones and David Prestor use the biographies supplied by the client', () => {
  assert.match(main, /Laura Jones es una figura europea reconocida en todo el mundo Country/);
  assert.match(main, /Promueve desde hace dos décadas, junto con su marido Jonatan, el gran evento Western Experience/);
  assert.match(main, /David Prestor es un reconocido coreógrafo de Country Line Dance de origen esloveno/);
  assert.match(main, /On The Road Again o Pay Me My Money Down/);
});
