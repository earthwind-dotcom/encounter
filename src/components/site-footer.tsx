import Link from 'next/link';
import { t, type Lang } from '@/lib/i18n';

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
          <Link href="/about/method">How the work is done</Link>
          <Link href="/course">{t('navCourse', lang)}</Link>
          <Link href="/about/status">What’s finished</Link>
          <Link href="/library">{t('navLibrary', lang)}</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/talk">{t('navTalk', lang)}</Link>
          <Link href="/about">{t('navAbout', lang)}</Link>
        </nav>
      </div>
    </footer>
  );
}
