import 'server-only';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { cache } from 'react';
import matter from 'gray-matter';
import { Marked } from 'marked';
import { CONFIDENCE, isConfidence, type Lang } from './i18n';

/**
 * Everything the app publishes lives in /content and is read at build or request time:
 *   - library.json        46 articles imported from Marginalia (scripts/import-legacy.mts)
 *   - course/*.md         the 13 sessions (scripts/import-vault.mts), participant + facilitator
 *   - questions/*.md      Hard Questions, written for the platform; <slug>.es.md for Spanish
 */
const CONTENT = path.join(process.cwd(), 'content');

// ---------- markdown, with confidence labels ----------

const marked = new Marked({ gfm: true, breaks: false });

/**
 * `[consensus]`, `*[debated: the two views]*`, `[my read]` become the confidence badge.
 * The vault writes "my read" (the facilitator's voice); the site calls it "Our read".
 */
const LABEL_RE = /\*?\[(consensus|strong majority|debated|my read|our read|rejected)([^\]]*)\]\*?(?!\()/gi;

export function withBadges(md: string, lang: Lang = 'en'): string {
  return md.replace(LABEL_RE, (_, raw: string, rest: string) => {
    const key = raw.toLowerCase() === 'my read' ? 'our read' : raw.toLowerCase();
    const label = isConfidence(key) ? CONFIDENCE[key][lang] : raw;
    const tail = rest.replace(/^[:;,]\s*/, '').trim();
    return `<span class="conf">${label}</span>${tail ? `<span class="conf-note">${tail}</span>` : ''}`;
  });
}

export const renderMarkdown = (md: string, lang: Lang = 'en') => marked.parse(withBadges(md, lang)) as string;

// ---------- library ----------

export type Localized = Partial<Record<Lang, string>>;
export interface LibraryArticle {
  id: string;
  slug: string;
  n: string;
  title: Localized;
  ref: string;
  langs: Lang[];
  html: string;
  text: string;
}
export interface LibrarySection {
  note: Localized;
  articles: LibraryArticle[];
}

export const LIBRARY_SECTIONS = {
  reflections: { name: 'Reflections', blurb: { en: 'Sermons, printed with the research they rest on.', es: 'Sermones, publicados con la investigación en la que se apoyan.', pt: 'Sermões, publicados com a pesquisa em que se apoiam.' } },
  roots: { name: 'Roots', blurb: { en: 'Word studies: what the original words actually carried.', es: 'Estudios de palabras: lo que de verdad cargaban las palabras originales.', pt: 'Estudos de palavras: o que as palavras originais realmente carregavam.' } },
  provenance: { name: 'Provenance', blurb: { en: 'Where the texts came from, and how they reached us.', es: 'De dónde vienen los textos y cómo nos llegaron.', pt: 'De onde vieram os textos e como chegaram até nós.' } },
} as const;
export type LibraryKey = keyof typeof LIBRARY_SECTIONS;
export const isLibraryKey = (v: string): v is LibraryKey => v in LIBRARY_SECTIONS;

export const getLibrary = cache(
  (): Record<string, LibrarySection> => JSON.parse(readFileSync(path.join(CONTENT, 'library.json'), 'utf8')),
);

export function getLibraryArticle(section: string, slug: string): LibraryArticle | null {
  return getLibrary()[section]?.articles.find((a) => a.slug === slug) ?? null;
}

// ---------- course ----------

export interface Session {
  n: number;
  unit: 'A' | 'B' | 'C' | 'D';
  unitTitle: string;
  title: string;
  question: string;
  passage: string;
  practice: string;
  nextStep: string;
  invitation?: string;
  status: 'outline' | 'draft' | 'reviewed' | 'published';
  participant: string;
  facilitator: string;
}

export const getSessions = cache((): Session[] => {
  const dir = path.join(CONTENT, 'course');
  return readdirSync(dir)
    .filter((f) => /^session-\d+\.md$/.test(f))
    .map((f) => {
      const { data, content } = matter(readFileSync(path.join(dir, f), 'utf8'));
      const [, participant = '', facilitator = ''] = content.split(/<!-- (?:participant|facilitator) -->/);
      return { ...(data as Omit<Session, 'participant' | 'facilitator'>), participant: participant.trim(), facilitator: facilitator.trim() };
    })
    .sort((a, b) => a.n - b.n);
});

export const getSession = (n: number) => getSessions().find((s) => s.n === n) ?? null;

export const UNITS = {
  A: { en: 'The Sources', es: 'Las fuentes', pt: 'As fontes', q: { en: 'What are we reading, and how do we read it?', es: '¿Qué estamos leyendo, y cómo lo leemos?', pt: 'O que estamos lendo, e como lemos?' } },
  B: { en: 'What He Said and Did', es: 'Lo que dijo e hizo', pt: 'O que ele disse e fez', q: { en: 'Who was this person, on his own terms?', es: '¿Quién era esta persona, en sus propios términos?', pt: 'Quem era essa pessoa, nos próprios termos?' } },
  C: { en: 'The Claim', es: 'La afirmación', pt: 'A afirmação', q: { en: 'What are Christians actually asserting?', es: '¿Qué afirman realmente los cristianos?', pt: 'O que os cristãos realmente afirmam?' } },
  D: { en: 'Living It', es: 'Vivirlo', pt: 'Vivendo isso', q: { en: 'If I am in, what does a life look like?', es: 'Si me sumo, ¿cómo se ve una vida así?', pt: 'Se eu entrar, como é essa vida?' } },
} as const;

export function getFacilitatorDoc(name: string): { title: string; html: string } | null {
  const f = path.join(CONTENT, 'course', `${name}.md`);
  if (!existsSync(f)) return null;
  const { data, content } = matter(readFileSync(f, 'utf8'));
  return { title: String(data.title ?? name), html: renderMarkdown(content) };
}

// ---------- hard questions ----------

export interface Standing {
  label: string;
  claim: string;
}
export interface Question {
  slug: string;
  order: number;
  theme: string;
  title: string;
  short: string;
  body: string;
  standing: Standing[];
  reading: string[];
  related: { href: string; label: string }[];
  sessions: number[];
  lang: Lang;
  translated: boolean;
  reviewed: boolean;
}

function readQuestion(file: string, slug: string, lang: Lang, translated: boolean): Question {
  const { data, content } = matter(readFileSync(file, 'utf8'));
  return {
    slug,
    order: Number(data.order ?? 99),
    theme: String(data.theme ?? ''),
    title: String(data.title),
    short: String(data.short ?? ''),
    body: content.trim(),
    standing: (data.standing ?? []) as Standing[],
    reading: (data.reading ?? []) as string[],
    related: (data.related ?? []) as { href: string; label: string }[],
    sessions: (data.sessions ?? []) as number[],
    lang,
    translated,
    reviewed: Boolean(data.reviewed),
  };
}

/** Questions in the reader's language where a translation exists, English otherwise. */
export const getQuestions = cache((lang: Lang = 'en'): Question[] => {
  const dir = path.join(CONTENT, 'questions');
  return readdirSync(dir)
    .filter((f) => /^[a-z0-9-]+\.md$/.test(f))
    .map((f) => {
      const slug = f.replace(/\.md$/, '');
      const localized = path.join(dir, `${slug}.${lang}.md`);
      return lang !== 'en' && existsSync(localized)
        ? readQuestion(localized, slug, lang, true)
        : readQuestion(path.join(dir, f), slug, 'en', lang === 'en');
    })
    .sort((a, b) => a.order - b.order);
});

export const getQuestion = (slug: string, lang: Lang = 'en') => getQuestions(lang).find((q) => q.slug === slug) ?? null;
