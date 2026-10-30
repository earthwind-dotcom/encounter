import Link from 'next/link';
import { pick, t, type Lang } from '@/lib/i18n';
import { Mark } from './site-header';

export function SiteFooter({ lang }: { lang: Lang }) {
  const cols: { title: string; links: [string, string][] }[] = [
    {
      title: pick({ en: 'Explore', es: 'Explora', pt: 'Explore' }, lang),
      links: [
        ['/questions', t('navQuestions', lang)],
        ['/course', t('navCourse', lang)],
        ['/library', t('navLibrary', lang)],
        ['/search', t('search', lang)],
      ],
    },
    {
      title: pick({ en: 'The work', es: 'El trabajo', pt: 'O trabalho' }, lang),
      links: [
        ['/about', t('navAbout', lang)],
        ['/about/method', pick({ en: 'How the work is done', es: 'Cómo se hace el trabajo', pt: 'Como o trabalho é feito' }, lang)],
        ['/about/status', pick({ en: 'What’s finished', es: 'Qué está terminado', pt: 'O que está pronto' }, lang)],
      ],
    },
    {
      title: pick({ en: 'People', es: 'Personas', pt: 'Pessoas' }, lang),
      links: [
        ['/talk', t('navTalk', lang)],
        ['/account', t('account', lang)],
        ['/privacy', pick({ en: 'Privacy', es: 'Privacidad', pt: 'Privacidade' }, lang)],
      ],
    },
  ];
  return (
    <footer className="shell mt-28 pb-6">
      <div className="glass grid gap-10 p-8 sm:p-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2.5">
            <Mark size={28} />
            <span className="mono text-[.76rem] font-medium tracking-[.3em] uppercase">Encounter</span>
          </div>
          <p className="mt-4 max-w-sm text-[.98rem] italic leading-relaxed text-[var(--ink-soft)]">{t('footerNote', lang)}</p>
        </div>
        {cols.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="kicker">{col.title}</p>
            <ul className="sans mt-3 list-none space-y-2 p-0 text-[.92rem]">
              {col.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-[var(--ink-soft)] hover:text-[var(--accent)]">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="sans mt-5 px-2 text-center text-[.76rem] text-[var(--faint)]">
        {pick({ en: 'Readable without an account, always.', es: 'Siempre se puede leer sin cuenta.', pt: 'Sempre dá para ler sem conta.' }, lang)}
      </p>
    </footer>
  );
}
