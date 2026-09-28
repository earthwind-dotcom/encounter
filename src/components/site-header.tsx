import Link from 'next/link';
import { t, type Lang } from '@/lib/i18n';
import { LangSwitch } from './lang-switch';
import { ThemeToggle } from './theme-toggle';
import { NavLinks } from './nav-links';

export function SiteHeader({ lang, user }: { lang: Lang; user: { name: string; role: string } | null }) {
  const links = [
    { href: '/questions', label: t('navQuestions', lang) },
    { href: '/course', label: t('navCourse', lang) },
    { href: '/library', label: t('navLibrary', lang) },
    { href: '/about', label: t('navAbout', lang) },
  ];
  return (
    <header className="border-b border-[var(--rule)]">
      <div className="shell flex flex-wrap items-center justify-between gap-x-8 gap-y-3 pt-6 pb-4">
        <Link href="/" className="group flex items-baseline gap-3 text-[var(--ink)]" aria-label="Encounter, home">
          <span className="mono text-[.82rem] font-medium tracking-[.34em] uppercase">Encounter</span>
          <span className="hidden sm:inline text-[.95rem] italic text-[var(--ink-soft)]">{t('tagline', lang)}</span>
        </Link>
        <div className="flex items-center gap-3">
          <LangSwitch lang={lang} />
          <ThemeToggle label={t('theme', lang)} />
          {user ? (
            <Link href="/account" className="kicker hover:text-[var(--ink)]">
              {t('account', lang)}
            </Link>
          ) : (
            <Link href="/signin" className="kicker hover:text-[var(--ink)]">
              {t('signIn', lang)}
            </Link>
          )}
        </div>
      </div>
      <nav aria-label="Main" className="shell -mb-px flex flex-wrap items-end gap-x-7 gap-y-1 overflow-x-auto">
        <NavLinks links={links} />
        <Link href="/talk" className="kicker kicker-accent ml-auto pb-3 hover:text-[var(--ink)]">
          {t('navTalk', lang)}
        </Link>
      </nav>
    </header>
  );
}
