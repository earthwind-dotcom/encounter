/**
 * One-way import of the Marginalia single-file site (legacy/marginalia.html) into
 * content/library.json, which the app renders.
 *
 * Every article keeps its authored HTML, including the .l-en / .l-es / .l-pt blocks, so
 * nothing already translated is lost. What changes:
 *   - `#section/id` hash links become real URLs (/library/roots/praus, /about/method, ...)
 *   - `hidden` attributes and the page-level script hooks are dropped
 *   - the brand name in running copy is left alone; see docs/BRAND.md for the rename rules
 *
 * Run: npm run import:legacy. The output is committed; rerun only if legacy/ changes.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const html = readFileSync(path.join(ROOT, 'legacy/marginalia.html'), 'utf8');

// The legacy check.py kept this record of which article carries which languages.
const translations: Record<string, string[]> = JSON.parse(readFileSync(path.join(ROOT, 'legacy/translations.json'), 'utf8'));

type Lang = 'en' | 'es' | 'pt';
type Localized = Partial<Record<Lang, string>>;

/** Where each legacy section lives in the new app, and the id prefix it strips for the slug. */
export const SECTIONS = {
  reflections: { base: '/library/reflections', prefix: '' },
  roots: { base: '/library/roots', prefix: 'roots-' },
  provenance: { base: '/library/provenance', prefix: 'prov-' },
  wonder: { base: '/library/wonder', prefix: 'wonder-' },
  encounter: { base: '/course/pathway', prefix: 'enc-' },
  colophon: { base: '/about', prefix: 'col-' },
} as const;
type SectionKey = keyof typeof SECTIONS;

const slugOf = (section: SectionKey, id: string) => {
  const p = SECTIONS[section].prefix;
  return p && id.startsWith(p) ? id.slice(p.length) : id;
};

const decode = (s: string) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '·')
    .replace(/&ndash;/g, '–')
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&amp;/g, '&')
    .replace(/&([a-z])(acute|grave|tilde|circ|cedil|uml);/gi, (_, c: string, k: string) => {
      const map: Record<string, string> = { acute: '́', grave: '̀', tilde: '̃', circ: '̂', cedil: '̧', uml: '̈' };
      return (c + map[k]).normalize('NFC');
    })
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/\s+/g, ' ')
    .trim();

function localized(fragment: string): Localized {
  const out: Localized = {};
  for (const lang of ['en', 'es', 'pt'] as Lang[]) {
    const m = fragment.match(new RegExp(`<span class="l-${lang}">([\\s\\S]*?)</span>`));
    if (m) out[lang] = decode(m[1]);
  }
  if (!out.en) out.en = decode(fragment);
  return out;
}

function rewriteLinks(body: string): string {
  return body.replace(/href="#([a-z]+)\/([a-z0-9-]+)"/g, (whole, sec: string, id: string) => {
    if (!(sec in SECTIONS)) return whole;
    const s = sec as SectionKey;
    return `href="${SECTIONS[s].base}/${slugOf(s, id)}"`;
  });
}

interface Article {
  id: string;
  slug: string;
  n: string;
  title: Localized;
  ref: string;
  langs: Lang[];
  html: string;
  text: string;
}

const out: Record<string, { note: Localized; articles: Article[] }> = {};

for (const key of Object.keys(SECTIONS) as SectionKey[]) {
  const view = html.match(new RegExp(`<div class="view" id="view-${key}"[\\s\\S]*?(?=<div class="view" id="view-|<footer|<!-- =+ SEARCH|$)`));
  if (!view) throw new Error(`section ${key} not found`);
  const v = view[0];
  const noteM = v.match(/<p class="sectionnote">([\s\S]*?)<\/p>/);
  const toc = [...v.matchAll(/<a class="toc-item" href="#[a-z]+\/([a-z0-9-]+)"[^>]*>([\s\S]*?)<\/a>/g)];
  const articles: Article[] = [];
  for (const [, id, inner] of toc) {
    const n = decode(inner.match(/<span class="n">([\s\S]*?)<\/span>/)?.[1] ?? '');
    const tM = inner.match(/<span class="t">([\s\S]*?)<\/span>\s*(?:<span class="r">|$)/);
    const r = decode(inner.match(/<span class="r">([\s\S]*?)<\/span>/)?.[1] ?? '');
    const artM = v.match(new RegExp(`<article id="${id}"[^>]*>([\\s\\S]*?)</article>`));
    if (!artM) throw new Error(`article ${id} not found in ${key}`);
    const body = rewriteLinks(artM[1]).replace(/\s+hidden(?=[\s>])/g, '').trim();
    const langs = (translations[id] ?? ['en']) as Lang[];
    // English-only plain text, for search and descriptions.
    const enOnly = body
      .replace(/<(div|span|p) class="l-(es|pt)">[\s\S]*?<\/\1>/g, '')
      .replace(/<p class="xlate">[\s\S]*?<\/p>/g, '');
    articles.push({
      id,
      slug: slugOf(key, id),
      n,
      title: tM ? localized(tM[1]) : { en: id },
      ref: r,
      langs,
      html: body,
      text: decode(enOnly).slice(0, 20000),
    });
  }
  out[key] = { note: noteM ? localized(noteM[1]) : {}, articles };
}

mkdirSync(path.join(ROOT, 'content'), { recursive: true });
writeFileSync(path.join(ROOT, 'content/library.json'), JSON.stringify(out, null, 1) + '\n');
const count = Object.values(out).reduce((n, s) => n + s.articles.length, 0);
console.log(`imported ${count} articles into content/library.json`);
