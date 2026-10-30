import type { Metadata } from 'next';
import Link from 'next/link';
import { getLang } from '@/lib/lang';
import { fold, search } from '@/lib/search';
import { pick, t } from '@/lib/i18n';
import { Search, SearchX } from 'lucide-react';
import { IconTile, PageHeader } from '@/components/ui';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: pick({ en: 'Search', es: 'Buscar', pt: 'Buscar' }, lang), robots: { index: false },
  };
}

function Highlight({ text, term }: { text: string; term: string }) {
  const i = term ? fold(text).indexOf(term) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded bg-[var(--accent-soft)] px-1 text-[var(--accent)]">{text.slice(i, i + term.length)}</mark>
      {text.slice(i + term.length)}
    </>
  );
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? '').slice(0, 120);
  const lang = await getLang();
  const hits = q ? search(q, lang) : [];
  const first = fold(q).split(/\s+/).find((x) => x.length > 1) ?? '';

  return (
    <div className="shell max-w-4xl">
      <PageHeader kicker={t('search', lang)} title={pick({ en: 'Find anything.', es: 'Encuentra lo que sea.', pt: 'Encontre qualquer coisa.' }, lang)} />
      <form role="search" action="/search" className="glass-strong rise rise-1 mt-8 flex items-center gap-2 rounded-full p-1.5 pl-5">
        <Search size={19} className="shrink-0 text-[var(--faint)]" />
        <label className="sr-only" htmlFor="q">{t('search', lang)}</label>
        <input id="q" name="q" type="search" defaultValue={q} autoFocus className="sans h-11 w-full min-w-0 bg-transparent text-[1.05rem] text-[var(--ink)] outline-none placeholder:text-[var(--faint)]" placeholder={pick({ en: 'Search questions, sessions and the library', es: 'Busca preguntas, sesiones y la biblioteca', pt: 'Busque perguntas, sessões e a biblioteca' }, lang)} />
        <button className="btn">{t('search', lang)}</button>
      </form>
      <p className="sans mt-3 px-5 text-[.78rem] text-[var(--faint)]">
        {pick({ en: 'Tip: press', es: 'Consejo: presiona', pt: 'Dica: pressione' }, lang)} <kbd>⌘K</kbd> {pick({ en: 'anywhere to search.', es: 'en cualquier página para buscar.', pt: 'em qualquer página para buscar.' }, lang)}
      </p>
      {q && (
        <p className="kicker mt-10" role="status">
          {hits.length} {pick({ en: hits.length === 1 ? 'result' : 'results', es: hits.length === 1 ? 'resultado' : 'resultados', pt: hits.length === 1 ? 'resultado' : 'resultados' }, lang)}
        </p>
      )}
      <ul className="mt-4 list-none space-y-3 p-0">
        {hits.map((h) => (
          <li key={h.href}>
            <Link href={h.href} className="glass lift group block p-5 text-[var(--ink)]">
              <span className="pill pill-accent">{h.section}</span>
              <span className="mt-2.5 block text-[1.18rem] font-medium leading-snug">{h.title}</span>
              <span className="mt-1 block text-[.93rem] leading-normal text-[var(--ink-soft)]"><Highlight text={h.snippet} term={first} /></span>
            </Link>
          </li>
        ))}
      </ul>
      {q && hits.length === 0 && (
        <div className="glass mt-4 flex flex-col items-center gap-3 p-10 text-center">
          <IconTile><SearchX size={19} /></IconTile>
          <p className="text-[var(--ink-soft)]">
            {pick({ en: 'Nothing matched. Try fewer words, or ask a person:', es: 'No hubo coincidencias. Prueba con menos palabras, o pregúntale a una persona:', pt: 'Nada encontrado. Tente menos palavras, ou pergunte a uma pessoa:' }, lang)}{' '}
            <Link href="/talk">{t('navTalk', lang)}</Link>
          </p>
        </div>
      )}
    </div>
  );
}
