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
  assert.deepEqual(names.slice(0, 10), [
    'Pol F. Ryan',
    'Algaly Fofana',
    'David Villellas',
    'Sofía Balzano',
    'Montse Moscardó',
    'Laura Jones',
    'Silvia Denise',
    'Virginie Barjaud',
    'Silvia Calsina',
    'Neus Lloveras'
  ]);
});

test('Silvia Denise and Virginie Barjaud use real supplied photos', async () => {
  assert.match(main, /Silvia Denise[\s\S]*?artist-silvia-denise\.jpg/);
  assert.match(main, /Virginie Barjaud[\s\S]*?artist-virginie-barjaud\.jpg/);
  for (const filename of ['artist-silvia-denise.jpg', 'artist-virginie-barjaud.jpg']) {
    const path = `${root}public/assets/${filename}`;
    await access(path);
    assert.ok((await stat(path)).size > 10_000, `${filename} must not be an empty placeholder`);
  }
});

test('the question-mark discovery card is not rendered or counted', () => {
  assert.doesNotMatch(main, /<article className="c-artist c-mystery"/);
  assert.match(main, /const artistCardTotal = artists\.length;/);
});
