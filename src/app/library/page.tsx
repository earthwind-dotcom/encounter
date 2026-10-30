import type { Metadata } from 'next';
import Link from 'next/link';
import { getLang } from '@/lib/lang';
import { getLibrary, LIBRARY_SECTIONS, type LibraryKey } from '@/lib/content';
import { pick, t } from '@/lib/i18n';
import { ArrowRight, Feather, ScrollText, Sprout } from 'lucide-react';
import { IconTile, PageHeader } from '@/components/ui';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: pick({ en: 'Library', es: 'Biblioteca', pt: 'Biblioteca' }, lang),
    description: pick({ en: 'Sermons with their research shown, word studies, and studies of where the biblical texts came from.', es: 'Sermones con su investigación a la vista, estudios de palabras y estudios de dónde vienen los textos bíblicos.', pt: 'Sermões com a pesquisa à mostra, estudos de palavras e estudos de onde vieram os textos bíblicos.' }, lang),
  };
}

export default async function LibraryPage() {
  const lang = await getLang();
  const lib = getLibrary();
  const icons: Record<LibraryKey, React.ReactNode> = { reflections: <Feather size={20} />, roots: <Sprout size={20} />, provenance: <ScrollText size={20} /> };
  return (
    <div className="shell">
      <PageHeader
        kicker={t('navLibrary', lang)}
        title={pick({ en: 'The working, shown.', es: 'El trabajo, a la vista.', pt: 'O trabalho, à mostra.' }, lang)}
        dek={pick(
          {
            en: 'The research underneath everything else here. Every entry shows its sources and how confident the scholarship is, claim by claim. Originally published as Marginalia.',
            es: 'La investigación que sostiene todo lo demás. Cada entrada muestra sus fuentes y qué tan segura es la investigación, afirmación por afirmación. Publicado originalmente como Marginalia.',
            pt: 'A pesquisa por trás de todo o resto. Cada entrada mostra suas fontes e o grau de certeza da pesquisa, afirmação por afirmação. Publicado originalmente como Marginalia.',
          },
          lang,
        )}
      />
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {(Object.keys(LIBRARY_SECTIONS) as LibraryKey[]).map((key, i) => (
          <section key={key} className={`glass rise rise-${i + 1} flex flex-col p-6`} aria-labelledby={`lib-${key}`}>
            <header className="flex items-start gap-4 border-b border-[var(--rule)] pb-5">
              <IconTile>{icons[key]}</IconTile>
              <div className="min-w-0">
                <h2 id={`lib-${key}`} className="text-[1.45rem] font-medium leading-tight">
                  <Link href={`/library/${key}`} className="text-[var(--ink)] hover:text-[var(--accent)]">{LIBRARY_SECTIONS[key].name}</Link>
                </h2>
                <p className="mt-1 text-[.93rem] italic leading-snug text-[var(--ink-soft)]">{pick(LIBRARY_SECTIONS[key].blurb, lang)}</p>
              </div>
            </header>
            <ul className="-mx-2 mt-3 list-none p-0">
              {lib[key].articles.map((a) => (
                <li key={a.slug}>
                  <Link href={`/library/${key}/${a.slug}`} className="group flex items-start gap-3 rounded-xl px-2 py-2.5 text-[var(--ink)] hover:bg-[var(--glass-inner-hover)]">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[1rem] leading-snug group-hover:text-[var(--accent)]">{pick(a.title, lang)}</span>
                      <span className="mono text-[.66rem] text-[var(--faint)]">{a.ref}</span>
                    </span>
                    <ArrowRight size={14} className="mt-1 shrink-0 text-[var(--faint)] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-[var(--accent)] group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="sans mt-auto pt-4 text-[.78rem] text-[var(--faint)]">
              {lib[key].articles.length} {pick({ en: 'entries', es: 'entradas', pt: 'entradas' }, lang)}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
