'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, CornerDownLeft, GraduationCap, HelpCircle, Info, Library, MessageCircle, Search, User } from 'lucide-react';
import { pick, type Lang } from '@/lib/i18n';

interface Hit { href: string; section: string; title: string; snippet: string }
interface Item { href: string; title: string; section: string; icon?: React.ReactNode }

const COPY = {
  placeholder: { en: 'Search questions, sessions and the library…', es: 'Busca preguntas, sesiones y la biblioteca…', pt: 'Busque perguntas, sessões e a biblioteca…' },
  jump: { en: 'Go to', es: 'Ir a', pt: 'Ir para' },
  results: { en: 'Results', es: 'Resultados', pt: 'Resultados' },
  none: { en: 'Nothing matched. Try fewer words.', es: 'No hubo coincidencias. Prueba con menos palabras.', pt: 'Nada encontrado. Tente menos palavras.' },
  all: { en: 'See every result for', es: 'Ver todos los resultados de', pt: 'Ver todos os resultados de' },
  search: { en: 'Search', es: 'Buscar', pt: 'Buscar' },
  page: { en: 'Page', es: 'Página', pt: 'Página' },
  open: { en: 'to open', es: 'para abrir', pt: 'para abrir' },
  move: { en: 'to move', es: 'para moverte', pt: 'para mover' },
};

/**
 * Site-wide quick search. Opens with ⌘K / Ctrl+K, "/", or the header button. Uses a native
 * <dialog>, so focus trapping, Escape and the top layer come from the browser.
 */
export function CommandPalette({ lang, links }: { lang: Lang; links: { href: string; label: string }[] }) {
  const c = (k: keyof typeof COPY) => pick(COPY[k], lang);
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const [result, setResult] = useState<{ term: string; hits: Hit[] } | null>(null);
  // Results only count for the query that produced them, so stale hits never flash.
  const hits = result && result.term === q.trim() && q.trim().length >= 2 ? result.hits : null;
  const [active, setActive] = useState(0);

  const open = useCallback(() => {
    dialog.current?.showModal();
    requestAnimationFrame(() => input.current?.select());
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing && !dialog.current?.open)) {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Debounced fetch; a stale response never overwrites a newer query.
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const data = (await res.json()) as { hits: Hit[] };
        setResult({ term, hits: data.hits });
        setActive(0);
      } catch {}
    }, 140);
    return () => {
      clearTimeout(id);
      ctrl.abort();
    };
  }, [q]);

  const icons: Record<string, React.ReactNode> = {
    '/questions': <HelpCircle size={16} />,
    '/course': <GraduationCap size={16} />,
    '/library': <Library size={16} />,
    '/about': <Info size={16} />,
    '/talk': <MessageCircle size={16} />,
    '/account': <User size={16} />,
  };
  const items: Item[] = hits
    ? hits.map((h) => ({ href: h.href, title: h.title, section: h.section, icon: icons[`/${h.href.split('/')[1]}`] }))
    : links.filter((l) => !q.trim() || l.label.toLowerCase().includes(q.trim().toLowerCase())).map((l) => ({ href: l.href, title: l.label, section: c('page'), icon: icons[l.href] }));
  const showAll = q.trim().length >= 2;
  const count = items.length + (showAll ? 1 : 0);

  const go = (href: string) => {
    dialog.current?.close();
    setQ('');
    router.push(href);
  };
  const choose = (i: number) => (i < items.length ? go(items[i].href) : go(`/search?q=${encodeURIComponent(q.trim())}`));

  return (
    <>
      <button type="button" onClick={open} className="icon-btn lg:hidden" aria-label={c('search')}>
        <Search size={18} />
      </button>
      <button
        type="button"
        onClick={open}
        className="sans hidden h-9 items-center gap-2 rounded-full border border-[var(--rule)] bg-[var(--glass-inner)] pl-3 pr-1.5 text-[.84rem] text-[var(--faint)] transition-colors hover:border-[var(--rule-strong)] hover:text-[var(--ink)] lg:inline-flex xl:w-40"
      >
        <Search size={15} />
        <span className="hidden flex-1 text-left xl:inline">{c('search')}</span>
        <kbd>⌘K</kbd>
      </button>

      <dialog
        ref={dialog}
        aria-label={c('search')}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="glass-strong m-0 mx-auto mt-[12vh] w-[min(640px,calc(100vw-24px))] max-w-none overflow-hidden rounded-[22px] p-0"
      >
        <div className="flex items-center gap-3 border-b border-[var(--rule)] px-5">
          <Search size={18} className="shrink-0 text-[var(--faint)]" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % Math.max(count, 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + count) % Math.max(count, 1)); }
              if (e.key === 'Enter' && count > 0) { e.preventDefault(); choose(active); }
            }}
            placeholder={c('placeholder')}
            aria-label={c('search')}
            aria-controls="palette-list"
            aria-activedescendant={count ? `palette-${active}` : undefined}
            role="combobox"
            aria-expanded="true"
            className="sans h-14 w-full bg-transparent text-[1.02rem] text-[var(--ink)] outline-none placeholder:text-[var(--faint)]"
          />
          <kbd className="shrink-0">esc</kbd>
        </div>

        <div className="max-h-[min(60vh,460px)] overflow-y-auto p-2">
          <p className="kicker px-3 pb-1 pt-2">{hits ? c('results') : c('jump')}</p>
          {hits && hits.length === 0 && <p className="sans px-3 py-3 text-[.92rem] text-[var(--ink-soft)]">{c('none')}</p>}
          <ul id="palette-list" role="listbox" className="m-0 list-none p-0">
            {items.map((it, i) => (
              <li
                key={it.href}
                id={`palette-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseMove={() => setActive(i)}
                onClick={() => choose(i)}
                className={`sans flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ${i === active ? 'bg-[var(--accent-soft)]' : ''}`}
              >
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--rule)] ${i === active ? 'text-[var(--accent)]' : 'text-[var(--faint)]'}`}>
                  {it.icon ?? <BookOpen size={15} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[.95rem] font-medium text-[var(--ink)]">{it.title}</span>
                  <span className="block truncate text-[.76rem] text-[var(--faint)]">{it.section}</span>
                </span>
                {i === active && <CornerDownLeft size={15} className="text-[var(--accent)]" />}
              </li>
            ))}
            {showAll && (
              <li
                id={`palette-${items.length}`}
                role="option"
                aria-selected={active === items.length}
                onMouseMove={() => setActive(items.length)}
                onClick={() => choose(items.length)}
                className={`sans mt-1 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[.9rem] text-[var(--accent)] ${active === items.length ? 'bg-[var(--accent-soft)]' : ''}`}
              >
                <ArrowRight size={15} /> {c('all')} “{q.trim()}”
              </li>
            )}
          </ul>
        </div>
        <div className="sans flex gap-4 border-t border-[var(--rule)] px-5 py-2.5 text-[.74rem] text-[var(--faint)]">
          <span><kbd>↵</kbd> {c('open')}</span>
          <span><kbd>↑</kbd> <kbd>↓</kbd> {c('move')}</span>
        </div>
      </dialog>
    </>
  );
}
