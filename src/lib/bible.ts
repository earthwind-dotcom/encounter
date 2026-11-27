import 'server-only';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * The World English Bible (public domain), one JSON file per book in content/bible/web, built by
 * scripts/build-bible.mts. Sessions name their passages in plain text ("Mark 14:53–65 and
 * 15:1–15"); `parseRefs` finds the references and `getPassage` reads the verses.
 */
const BOOKS: Record<string, string> = {
  genesis: 'GEN', exodus: 'EXO', leviticus: 'LEV', numbers: 'NUM', deuteronomy: 'DEU', joshua: 'JOS', judges: 'JDG', ruth: 'RUT',
  '1 samuel': '1SA', '2 samuel': '2SA', '1 kings': '1KI', '2 kings': '2KI', '1 chronicles': '1CH', '2 chronicles': '2CH', ezra: 'EZR',
  nehemiah: 'NEH', esther: 'EST', job: 'JOB', psalm: 'PSA', psalms: 'PSA', proverbs: 'PRO', ecclesiastes: 'ECC', 'song of songs': 'SNG',
  isaiah: 'ISA', jeremiah: 'JER', lamentations: 'LAM', ezekiel: 'EZK', daniel: 'DAN', hosea: 'HOS', joel: 'JOL', amos: 'AMO', obadiah: 'OBA',
  jonah: 'JON', micah: 'MIC', nahum: 'NAM', habakkuk: 'HAB', zephaniah: 'ZEP', haggai: 'HAG', zechariah: 'ZEC', malachi: 'MAL',
  matthew: 'MAT', mark: 'MRK', luke: 'LUK', john: 'JHN', acts: 'ACT', romans: 'ROM', '1 corinthians': '1CO', '2 corinthians': '2CO',
  galatians: 'GAL', ephesians: 'EPH', philippians: 'PHP', colossians: 'COL', '1 thessalonians': '1TH', '2 thessalonians': '2TH',
  '1 timothy': '1TI', '2 timothy': '2TI', titus: 'TIT', philemon: 'PHM', hebrews: 'HEB', james: 'JAS', '1 peter': '1PE', '2 peter': '2PE',
  '1 john': '1JN', '2 john': '2JN', '3 john': '3JN', jude: 'JUD', revelation: 'REV',
  // Spanish names, for the translated sessions.
  mateo: 'MAT', marcos: 'MRK', lucas: 'LUK', juan: 'JHN', hechos: 'ACT', romanos: 'ROM', '1 corintios': '1CO', '2 timoteo': '2TI', isaías: 'ISA',
};

export interface PassageRef {
  label: string;
  book: string;
  /** Inclusive range, chapter and verse. */
  from: [number, number];
  to: [number, number];
}

const BOOK_RE = /((?:[123]\s)?[A-ZÁÉÍÓÚ][a-záéíóúñ]+(?:\sof\s[A-Z][a-z]+)?)\s(\d+):(\d+)(?:[–-](?:(\d+):)?(\d+))?/g;
// A bare "15:1–15" after a book reference continues in the same book.
const BARE_RE = /(?<![\d:])(\d+):(\d+)(?:[–-](?:(\d+):)?(\d+))?/g;

export function parseRefs(text: string): PassageRef[] {
  const out: PassageRef[] = [];
  const seen = new Set<string>();
  let lastBook: { code: string; name: string; end: number } | null = null;
  const found: { index: number; end: number; name?: string; m: RegExpExecArray }[] = [];
  for (const m of text.matchAll(BOOK_RE)) {
    const code = BOOKS[m[1].toLowerCase()];
    if (code) found.push({ index: m.index!, end: m.index! + m[0].length, name: m[1], m: m as RegExpExecArray });
  }
  for (const m of text.matchAll(BARE_RE)) {
    if (!found.some((f) => m.index! >= f.index && m.index! < f.end)) found.push({ index: m.index!, end: m.index! + m[0].length, m: m as RegExpExecArray });
  }
  found.sort((a, b) => a.index - b.index);
  for (const f of found) {
    let name: string, code: string, ch: string, v: string, ch2: string | undefined, v2: string | undefined;
    if (f.name) {
      [, name, ch, v, ch2, v2] = f.m as unknown as string[];
      code = BOOKS[name.toLowerCase()];
    } else {
      if (!lastBook) continue;
      [, ch, v, ch2, v2] = f.m as unknown as string[];
      ({ code, name } = lastBook);
    }
    lastBook = { code, name, end: f.end };
    const from: [number, number] = [+ch, +v];
    const to: [number, number] = v2 ? [ch2 ? +ch2 : +ch, +v2] : from;
    const label = `${name} ${ch}:${v}${v2 ? `–${ch2 ? `${ch2}:` : ''}${v2}` : ''}`;
    if (!seen.has(label)) {
      seen.add(label);
      out.push({ label, book: code, from, to });
    }
  }
  return out;
}

const cache = new Map<string, Record<string, Record<string, string>>>();
function book(code: string) {
  if (!cache.has(code)) {
    const file = path.join(process.cwd(), 'content/bible/web', `${code}.json`);
    if (!existsSync(file)) return null;
    cache.set(code, JSON.parse(readFileSync(file, 'utf8')));
  }
  return cache.get(code)!;
}

export interface Verse {
  chapter: number;
  verse: number;
  text: string;
}

export function getPassage(ref: PassageRef, max = 80): Verse[] {
  const b = book(ref.book);
  if (!b) return [];
  const out: Verse[] = [];
  for (let c = ref.from[0]; c <= ref.to[0]; c++) {
    const chapter = b[String(c)];
    if (!chapter) break;
    const first = c === ref.from[0] ? ref.from[1] : 1;
    const last = c === ref.to[0] ? ref.to[1] : Math.max(...Object.keys(chapter).map(Number));
    for (let v = first; v <= last && out.length < max; v++) if (chapter[String(v)]) out.push({ chapter: c, verse: v, text: chapter[String(v)] });
  }
  return out;
}
