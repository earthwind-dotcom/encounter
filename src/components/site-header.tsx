import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { pick, t, type Lang } from '@/lib/i18n';
import { LangMenu, LangSwitch } from './lang-switch';
import { ThemeToggle } from './theme-toggle';
import { NavLinks } from './nav-links';
import { CommandPalette } from './command-palette';
import { MobileMenu } from './mobile-menu';

/** The brand mark: the favicon's "E", lit like the dawn behind it. */
export function Mark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0 drop-shadow-[0_6px_14px_var(--accent-glow)]">
      <defs>
        <linearGradient id="mark-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9794a" />
          <stop offset=".55" stopColor="#9a4a26" />
          <stop offset="1" stopColor="#6e3018" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#mark-g)" />
      <rect x=".75" y=".75" width="62.5" height="62.5" rx="15.25" fill="none" stroke="rgb(255 255 255 / .28)" strokeWidth="1.5" />
      <path d="M20 16h24v6H27v7h15v6H27v7h17v6H20z" fill="#fff7ef" />
    </svg>
  );
}

function Initials({ name }: { name: string }) {
  const letters = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '·';
  return (
    <span className="sans grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#e0956a] to-[#9a4a26] text-[.72rem] font-semibold text-white shadow-[0_4px_12px_-4px_var(--accent-glow)]">
      {letters}
    </span>
  );
}

export function SiteHeader({ lang, user }: { lang: Lang; user: { name: string; role: string } | null }) {
  const links = [
    { href: '/questions', label: t('navQuestions', lang) },
    { href: '/course', label: t('navCourse', lang) },
    { href: '/library', label: t('navLibrary', lang) },
    { href: '/about', label: t('navAbout', lang) },
  ];
  const talk = { href: '/talk', label: t('navTalk', lang) };
  const account = user ? { href: '/account', label: t('account', lang) } : { href: '/signin', label: t('signIn', lang) };
  const paletteLinks = [...links, talk, account, ...(user && user.role !== 'learner' ? [{ href: '/facilitate', label: t('desk', lang) }] : [])];

  return (
    <header className="no-print sticky top-0 z-40 pt-3">
      <div className="shell">
        <div className="glass-strong flex h-14 items-center gap-2 rounded-full pl-3 pr-2 sm:pl-4">
          <Link href="/" className="group mr-1 flex items-center gap-2.5 text-[var(--ink)]" aria-label="Encounter, home">
            <Mark />
            <span className="mono text-[.78rem] font-medium tracking-[.3em] uppercase">Encounter</span>
          </Link>

          <nav aria-label="Main" className="ml-3 hidden items-center gap-0.5 lg:flex">
            <NavLinks links={links} />
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <CommandPalette lang={lang} links={paletteLinks} />
            <div className="hidden items-center lg:flex">
              <LangMenu lang={lang} />
              <ThemeToggle label={t('theme', lang)} />
            </div>
            {user ? (
              <Link href="/account" className="hidden rounded-full p-0.5 transition-transform hover:scale-105 lg:block" aria-label={t('account', lang)} title={`${user.name} · ${t('account', lang)}`}>
                <Initials name={user.name} />
              </Link>
            ) : (
              <Link href="/signin" className="sans hidden whitespace-nowrap rounded-full px-3 py-1.5 text-[.88rem] font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] lg:block">
                {t('signIn', lang)}
              </Link>
            )}
            <Link href="/talk" className="btn btn-sm ml-1 hidden xl:inline-flex">
              <MessageCircle size={15} /> {t('navTalk', lang)}
            </Link>
            <MobileMenu links={links} talk={talk} account={account} label={pick({ en: 'Menu', es: 'Menú', pt: 'Menu' }, lang)}>
              <LangSwitch lang={lang} />
              <ThemeToggle label={t('theme', lang)} />
            </MobileMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
