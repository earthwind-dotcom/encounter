import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import matter from 'gray-matter';
import { getLibrary, getQuestions, getSessions, renderMarkdown, withBadges } from '@/lib/content';
import { CONFIDENCE } from '@/lib/i18n';

/**
 * The editorial rules from Marginalia, now machine-checked for everything Encounter publishes.
 * See docs/EDITORIAL.md. A failure here means the content broke a rule, not that the test is wrong.
 */
const ROOT = path.resolve(__dirname, '..');
const questionFiles = readdirSync(path.join(ROOT, 'content/questions')).filter((f) => f.endsWith('.md'));
const questions = getQuestions('en');
const sessions = getSessions();
const lib = getLibrary();

// Every internal path the app serves, for link checking.
const routes = new Set<string>([
  '/', '/questions', '/course', '/library', '/talk', '/privacy', '/about', '/account', '/signin', '/signup', '/search',
  ...questions.map((q) => `/questions/${q.slug}`),
  ...sessions.map((s) => `/course/${s.n}`),
  ...lib.encounter.articles.map((a) => `/course/pathway/${a.slug}`),
  ...['reflections', 'roots', 'provenance', 'wonder'].flatMap((s) => [`/library/${s}`, ...lib[s].articles.map((a) => `/library/${s}/${a.slug}`)]),
  ...lib.colophon.articles.map((a) => `/about/${a.slug}`),
]);

describe('voice', () => {
  it('uses no em dashes in anything written for the platform', () => {
    for (const f of questionFiles) {
      expect(readFileSync(path.join(ROOT, 'content/questions', f), 'utf8'), f).not.toMatch(/—/);
    }
  });
  it('keeps the course free of em dashes', () => {
    for (const f of readdirSync(path.join(ROOT, 'content/course')).filter((x) => x.endsWith('.md'))) {
      // `source:` names the vault file verbatim and is never shown.
      const text = readFileSync(path.join(ROOT, 'content/course', f), 'utf8').replace(/^source: .*$/m, '');
      expect(text, f).not.toMatch(/\u2014/);
    }
  });
  it('keeps the imported library free of em dashes too', () => {
    for (const s of Object.values(lib)) for (const a of s.articles) expect(a.html, a.id).not.toMatch(/—|&mdash;/);
  });
});

describe('confidence labels', () => {
  const allowed = new Set(Object.keys(CONFIDENCE));
  it('uses only the five labels in question frontmatter', () => {
    for (const q of questions) for (const s of q.standing) expect(allowed.has(s.label), `${q.slug}: ${s.label}`).toBe(true);
  });
  it('renders "my read" as Our read and leaves links alone', () => {
    expect(withBadges('*[my read]*')).toContain('>Our read<');
    expect(withBadges('[debated: two views]')).toContain('two views');
    expect(withBadges('[consensus](https://example.org)')).toBe('[consensus](https://example.org)');
  });
});

describe('hard questions', () => {
  it('each has a title, a short answer, standing claims and real further reading', () => {
    expect(questions.length).toBeGreaterThanOrEqual(10);
    for (const q of questions) {
      expect(q.title, q.slug).toMatch(/\?$/);
      expect(q.short.length, q.slug).toBeGreaterThan(80);
      expect(q.standing.length, q.slug).toBeGreaterThan(0);
      expect(q.reading.length, q.slug).toBeGreaterThan(0);
    }
  });
  it('ends every answer with an open door', () => {
    for (const q of questions) expect(q.body, q.slug).toMatch(/## Where this leaves you/);
  });
  it('has unique order numbers', () => {
    const orders = questions.map((q) => q.order);
    expect(new Set(orders).size).toBe(orders.length);
  });
  it('links only to pages that exist', () => {
    for (const f of questionFiles) {
      const { data, content } = matter(readFileSync(path.join(ROOT, 'content/questions', f), 'utf8'));
      const hrefs = [
        ...((data.related ?? []) as { href: string }[]).map((r) => r.href),
        ...[...content.matchAll(/\]\((\/[^)\s#]*)/g)].map((m) => m[1]),
      ];
      for (const h of hrefs) expect(routes.has(h), `${f} -> ${h}`).toBe(true);
    }
  });
  it('points sessions at sessions that exist', () => {
    for (const q of questions) for (const n of q.sessions) expect(sessions.some((s) => s.n === n), `${q.slug} -> ${n}`).toBe(true);
  });
});

describe('translations of hard questions', () => {
  for (const lang of ['es', 'pt'] as const) {
    const localized = getQuestions(lang).filter((q) => q.translated);
    it(`${lang}: keeps the English order, labels and an open-door ending`, () => {
      for (const q of localized) {
        const en = questions.find((x) => x.slug === q.slug)!;
        expect(en, q.slug).toBeTruthy();
        expect(q.order, q.slug).toBe(en.order);
        expect(q.theme, q.slug).toBe(en.theme);
        expect(q.standing.map((s) => s.label), q.slug).toEqual(en.standing.map((s) => s.label));
        expect(q.body.match(/^## /gm)?.length, `${q.slug}: same number of sections`).toBe(en.body.match(/^## /gm)?.length);
        expect(q.body, q.slug).toMatch(lang === 'es' ? /## Dónde te deja esto/ : /## Onde isso deixa você/);
      }
    });
  }
  it('has Spanish for every question', () => {
    expect(getQuestions('es').filter((q) => q.translated).length).toBe(questions.length);
  });
});

describe('course', () => {
  it('has all thirteen sessions in four units', () => {
    expect(sessions.map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    expect(new Set(sessions.map((s) => s.unit))).toEqual(new Set(['A', 'B', 'C', 'D']));
  });
  it('gives every written session a facilitator guide', () => {
    for (const s of sessions.filter((x) => x.status !== 'outline')) expect(s.facilitator.length, `session ${s.n}`).toBeGreaterThan(500);
  });
  it('renders every session without leftover wiki links', () => {
    for (const s of sessions) expect(renderMarkdown(s.participant + s.facilitator)).not.toMatch(/\[\[/);
  });
});

describe('library import', () => {
  it('carries all 46 Marginalia articles', () => {
    expect(Object.values(lib).reduce((n, s) => n + s.articles.length, 0)).toBe(46);
  });
  it('rewrote every old hash link to a real route', () => {
    for (const s of Object.values(lib)) {
      for (const a of s.articles) {
        expect(a.html, a.id).not.toMatch(/href="#[a-z]+\//);
        for (const m of a.html.matchAll(/href="(\/[^"#]*)"/g)) expect(routes.has(m[1]), `${a.id} -> ${m[1]}`).toBe(true);
      }
    }
  });
  it('keeps the translations Marginalia had', () => {
    const recorded: Record<string, string[]> = JSON.parse(readFileSync(path.join(ROOT, 'legacy/translations.json'), 'utf8'));
    for (const s of Object.values(lib)) {
      for (const a of s.articles) {
        for (const l of recorded[a.id] ?? ['en']) if (l !== 'en') expect(a.html, `${a.id} lost ${l}`).toContain(`class="l-${l}"`);
      }
    }
  });
});
