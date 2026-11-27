/**
 * Builds content/bible/web/<BOOK>.json from the World English Bible's USFM files (public domain,
 * ebible.org "engwebp_usfm.zip"). Each file is { "<chapter>": { "<verse>": "text" } }, plain
 * text with footnotes and cross-references removed.
 *
 * Run: node scripts/build-bible.mts /path/to/unzipped/usfm
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const src = process.argv[2];
if (!src) {
  console.error('Usage: node scripts/build-bible.mts <usfm-dir>');
  process.exit(1);
}
const OUT = path.join(process.cwd(), 'content/bible/web');
mkdirSync(OUT, { recursive: true });

const clean = (s: string) =>
  s
    .replace(/\\f\s[\s\S]*?\\f\*/g, '') // footnotes
    .replace(/\\x\s[\s\S]*?\\x\*/g, '') // cross references
    .replace(/\\\+?w\s([^|\\]*)(?:\|[^\\]*)?\\\+?w\*/g, '$1') // \w word|strong="..."\w*
    .replace(/\\\+?[a-z]+\d?\*?/g, '') // any other marker (\wj, \add, \q1, \p ...)
    .replace(/\s+/g, ' ')
    .replace(/\s([,.;:!?’”])/g, '$1')
    .trim();

let books = 0;
for (const file of readdirSync(src).filter((f) => /^\d\d-[0-9A-Z]{3}.*\.usfm$/.test(f) && !f.startsWith('00-'))) {
  const text = readFileSync(path.join(src, file), 'utf8');
  const code = text.match(/^\\id ([0-9A-Z]{3})/m)?.[1];
  if (!code) continue;
  const book: Record<string, Record<string, string>> = {};
  let chapter = '0';
  // Split on chapter and verse markers, keeping them.
  for (const part of text.split(/(?=\\c \d+|\\v \d+)/)) {
    const c = part.match(/^\\c (\d+)/);
    if (c) {
      chapter = c[1];
      book[chapter] = {};
      continue;
    }
    const v = part.match(/^\\v (\d+)\s([\s\S]*)/);
    if (v && book[chapter]) book[chapter][v[1]] = clean(v[2]);
  }
  writeFileSync(path.join(OUT, `${code}.json`), JSON.stringify(book));
  books++;
}
console.log(`Wrote ${books} books to ${path.relative(process.cwd(), OUT)}`);
