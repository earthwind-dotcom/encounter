import type { Metadata } from 'next';
import Link from 'next/link';
import { getLang } from '@/lib/lang';
import { fold, search } from '@/lib/search';
import { pick, t } from '@/lib/i18n';

export const metadata: Metadata = { title: 'Search', robots: { index: false } };

function Highlight({ text, term }: { text: string; term: string }) {
  const i = term ? fold(text).indexOf(term) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-sm bg-[var(--accent-soft)] px-0.5 text-[var(--ink)]">{text.slice(i, i + term.length)}</mark>
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
    <div className="shell max-w-3xl pt-12">
      <form role="search" action="/search" className="flex gap-3">
        <label className="sr-only" htmlFor="q">{t('search', lang)}</label>
        <input id="q" name="q" type="search" defaultValue={q} autoFocus className="input !text-[1.15rem]" placeholder={pick({ en: 'Search questions, sessions and the library', es: 'Busca preguntas, sesiones y la biblioteca', pt: 'Busque perguntas, sessões e a biblioteca' }, lang)} />
        <button className="btn">{t('search', lang)}</button>
      </form>
      {q && (
        <p className="kicker mt-6" role="status">
          {hits.length} {pick({ en: hits.length === 1 ? 'result' : 'results', es: hits.length === 1 ? 'resultado' : 'resultados', pt: hits.length === 1 ? 'resultado' : 'resultados' }, lang)}
        </p>
      )}
      <ul className="mt-2 list-none p-0">
        {hits.map((h) => (
          <li key={h.href} className="border-t border-[var(--rule)]">
            <Link href={h.href} className="group block py-4 text-[var(--ink)]">
              <span className="kicker kicker-accent">{h.section}</span>
              <span className="mt-1 block text-[1.15rem] leading-snug group-hover:text-[var(--accent)]">{h.title}</span>
              <span className="mt-1 block text-[.93rem] leading-normal text-[var(--ink-soft)]"><Highlight text={h.snippet} term={first} /></span>
            </Link>
          </li>
        ))}
      </ul>
      {q && hits.length === 0 && (
        <p className="mt-6 text-[var(--ink-soft)]">
          {pick({ en: 'Nothing matched. Try fewer words, or ask a person:', es: 'No hubo coincidencias. Prueba con menos palabras, o pregúntale a una persona:', pt: 'Nada encontrado. Tente menos palavras, ou pergunte a uma pessoa:' }, lang)}{' '}
          <Link href="/talk">{t('navTalk', lang)}</Link>
        </p>
      )}
    </div>
  );
}
