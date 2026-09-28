'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { setLanguage } from '@/app/actions';

/**
 * Renders an imported Marginalia article. The HTML is our own authored content from
 * content/library.json, never user input. The only behaviour it needs is the
 * "read in English" buttons (data-setlang) on untranslated entries.
 */
export function ArticleHtml({ html }: { html: string }) {
  const router = useRouter();
  const [, start] = useTransition();
  return (
    <div
      className="article"
      onClick={(e) => {
        const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-setlang]');
        const lang = btn?.dataset.setlang;
        if (!lang) return;
        document.documentElement.dataset.elang = lang;
        start(async () => {
          await setLanguage(lang);
          router.refresh();
        });
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
