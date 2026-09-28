import Link from 'next/link';
import { pick, t, type Lang } from '@/lib/i18n';

export function SiteFooter({ lang }: { lang: Lang }) {
  return (
    <footer className="mt-24 border-t border-[var(--rule)]">
      <div className="shell grid gap-8 py-10 sm:grid-cols-[1fr_auto]">
        <div>
          <p className="mono text-[.78rem] font-medium tracking-[.3em] uppercase">Encounter</p>
          <p className="mt-2 max-w-md text-[.95rem] italic text-[var(--ink-soft)]">{t('footerNote', lang)}</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-1 text-[.95rem]">
          <Link href="/questions">{t('navQuestions', lang)}</Link>
          <Link href="/about/method">{pick({ en: 'How the work is done', es: 'Cómo se hace el trabajo', pt: 'Como o trabalho é feito' }, lang)}</Link>
          <Link href="/course">{t('navCourse', lang)}</Link>
          <Link href="/about/status">{pick({ en: 'What’s finished', es: 'Qué está terminado', pt: 'O que está pronto' }, lang)}</Link>
          <Link href="/library">{t('navLibrary', lang)}</Link>
          <Link href="/privacy">{pick({ en: 'Privacy', es: 'Privacidad', pt: 'Privacidade' }, lang)}</Link>
          <Link href="/search">{t('search', lang)}</Link>
          <Link href="/talk">{t('navTalk', lang)}</Link>
          <Link href="/about">{t('navAbout', lang)}</Link>
        </nav>
      </div>
    </footer>
  );
}
