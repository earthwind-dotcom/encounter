import 'server-only';
import { getLibrary, getQuestions, getSessions, LIBRARY_SECTIONS, type LibraryKey } from './content';
import { pick, type Lang } from './i18n';

/**
 * Plain in-memory search over everything published. The corpus is small (a few hundred
 * thousand words), so a scan per query is fast and needs no index service.
 * Matching ignores case and accents, as Marginalia's did ("jesus" finds "Jesús").
 */
export interface Hit {
  href: string;
  section: string;
  title: string;
  snippet: string;
  score: number;
}

export const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const strip = (md: string) =>
  md
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*_`>#\[\]]/g, '')
    .replace(/\(\/[^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();

interface Doc {
  href: string;
  section: string;
  title: string;
  text: string;
  weight: number;
}

function corpus(lang: Lang): Doc[] {
  const docs: Doc[] = [];
  for (const q of getQuestions(lang)) {
    docs.push({ href: `/questions/${q.slug}`, section: 'Hard Questions', title: q.title, text: strip(`${q.short} ${q.body} ${q.standing.map((s) => s.claim).join(' ')}`), weight: 3 });
  }
  for (const s of getSessions()) {
    docs.push({ href: `/course/${s.n}`, section: `Session ${s.n}`, title: s.title, text: strip(`${s.question} ${s.passage} ${s.participant}`), weight: 2 });
  }
  const lib = getLibrary();
  for (const key of Object.keys(LIBRARY_SECTIONS) as LibraryKey[]) {
    for (const a of lib[key].articles) {
      docs.push({ href: `/library/${key}/${a.slug}`, section: LIBRARY_SECTIONS[key].name, title: pick(a.title, lang), text: `${a.ref} ${a.text}`, weight: 1 });
    }
  }
  for (const a of lib.encounter.articles) {
    docs.push({ href: `/course/pathway/${a.slug}`, section: 'Pathway', title: pick(a.title, lang), text: a.text, weight: 1 });
  }
  return docs;
}

const cache = new Map<Lang, { doc: Doc; ftitle: string; ftext: string }[]>();

export function search(query: string, lang: Lang, limit = 30): Hit[] {
  const terms = fold(query).split(/\s+/).filter((t) => t.length > 1).slice(0, 8);
  if (terms.length === 0) return [];
  let docs = cache.get(lang);
  if (!docs) {
    docs = corpus(lang).map((doc) => ({ doc, ftitle: fold(doc.title), ftext: fold(doc.text) }));
    cache.set(lang, docs);
  }
  const hits: Hit[] = [];
  for (const { doc, ftitle, ftext } of docs) {
    let score = 0;
    let all = true;
    for (const t of terms) {
      const inTitle = ftitle.includes(t);
      const count = ftext.split(t).length - 1;
      if (!inTitle && count === 0) {
        all = false;
        break;
      }
      score += (inTitle ? 10 : 0) + Math.min(count, 5);
    }
    if (!all) continue;
    hits.push({ href: doc.href, section: doc.section, title: doc.title, snippet: snippet(doc.text, terms[0]), score: score * doc.weight });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** About 30 words around the first match. Folding keeps character positions for these scripts. */
function snippet(text: string, term: string): string {
  const i = fold(text).indexOf(term);
  if (i < 0) return text.slice(0, 180) + (text.length > 180 ? '…' : '');
  const start = Math.max(0, text.lastIndexOf(' ', Math.max(0, i - 90)));
  const end = Math.min(text.length, i + 120);
  return (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');
}
