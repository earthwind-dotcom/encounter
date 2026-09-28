'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setLanguage } from '@/app/actions';
import { LANGS, type Lang } from '@/lib/i18n';

export function LangSwitch({ lang }: { lang: Lang }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center" role="group" aria-label="Language">
      {LANGS.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className="text-[var(--rule)] text-xs">/</span>}
          <button
            type="button"
            lang={l}
            aria-pressed={l === lang}
            disabled={pending}
            onClick={() =>
              start(async () => {
                document.documentElement.dataset.elang = l;
                await setLanguage(l);
                router.refresh();
              })
            }
            className={`mono px-1.5 py-1 text-[.66rem] tracking-[.14em] uppercase cursor-pointer ${
              l === lang ? 'text-[var(--accent)]' : 'text-[var(--faint)] hover:text-[var(--ink)]'
            }`}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
