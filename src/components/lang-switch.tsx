'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Globe } from 'lucide-react';
import { setLanguage } from '@/app/actions';
import { LANGS, type Lang } from '@/lib/i18n';

const NAMES: Record<Lang, string> = { en: 'English', es: 'Español', pt: 'Português' };

function useSetLang() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const set = (l: Lang) =>
    start(async () => {
      document.documentElement.dataset.elang = l;
      await setLanguage(l);
      router.refresh();
    });
  return [pending, set] as const;
}

/** Segmented EN / ES / PT, for the phone menu where there's room. */
export function LangSwitch({ lang }: { lang: Lang }) {
  const [pending, set] = useSetLang();
  return (
    <div className="flex items-center rounded-full border border-[var(--rule)] bg-[var(--glass-inner-2)] p-0.5" role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={l === lang}
          disabled={pending}
          onClick={() => set(l)}
          className={`sans h-8 min-w-10 cursor-pointer rounded-full px-2.5 text-[.74rem] font-semibold uppercase tracking-[.06em] transition-colors ${
            l === lang ? 'bg-[var(--glass-strong)] text-[var(--accent)] shadow-[var(--shadow-glass)]' : 'text-[var(--faint)] hover:text-[var(--ink)]'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

/** A globe button with a small glass menu, for the desktop header. */
export function LangMenu({ lang }: { lang: Lang }) {
  const [pending, set] = useSetLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Language: ${NAMES[lang]}`}
        onClick={() => setOpen((o) => !o)}
        className="sans inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-[.74rem] font-semibold uppercase tracking-[.06em] text-[var(--ink-soft)] hover:bg-[var(--glass-inner-hover)] hover:text-[var(--ink)]"
      >
        <Globe size={16} /> {lang}
      </button>
      {open && (
        <div role="menu" className="glass-strong absolute right-0 top-11 z-50 w-44 rounded-2xl p-1.5">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              role="menuitemradio"
              aria-checked={l === lang}
              lang={l}
              disabled={pending}
              onClick={() => {
                setOpen(false);
                if (l !== lang) set(l);
              }}
              className={`sans flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-[.88rem] ${
                l === lang ? 'text-[var(--accent)]' : 'text-[var(--ink)] hover:bg-[var(--glass-inner-hover)]'
              }`}
            >
              {NAMES[l]}
              {l === lang && <Check size={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
