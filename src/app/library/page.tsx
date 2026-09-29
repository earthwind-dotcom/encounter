import type { Metadata } from 'next';
import Link from 'next/link';
import { getLang } from '@/lib/lang';
import { getLibrary, LIBRARY_SECTIONS, type LibraryKey } from '@/lib/content';
import { pick, t } from '@/lib/i18n';

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
  return (
    <div className="shell pt-12">
      <p className="kicker kicker-accent">{t('navLibrary', lang)}</p>
      <h1 className="mt-3 max-w-[22ch] text-[clamp(2.1rem,1.4rem+2.6vw,3.2rem)] font-medium leading-tight">
        {pick({ en: 'The working, shown.', es: 'El trabajo, a la vista.', pt: 'O trabalho, à mostra.' }, lang)}
      </h1>
      <p className="mt-4 max-w-[62ch] text-[1.08rem] text-[var(--ink-soft)]">
        {pick(
          {
            en: 'The research underneath everything else here. Every entry shows its sources and how confident the scholarship is, claim by claim. Originally published as Marginalia.',
            es: 'La investigación que sostiene todo lo demás. Cada entrada muestra sus fuentes y qué tan segura es la investigación, afirmación por afirmación. Publicado originalmente como Marginalia.',
            pt: 'A pesquisa por trás de todo o resto. Cada entrada mostra suas fontes e o grau de certeza da pesquisa, afirmação por afirmação. Publicado originalmente como Marginalia.',
          },
          lang,
        )}
      </p>
      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        {(Object.keys(LIBRARY_SECTIONS) as LibraryKey[]).map((key) => (
          <section key={key} aria-labelledby={`lib-${key}`}>
            <header className="border-b border-[var(--rule)] pb-3">
              <h2 id={`lib-${key}`} className="text-[1.5rem] font-medium">
                <Link href={`/library/${key}`} className="text-[var(--ink)] hover:text-[var(--accent)]">{LIBRARY_SECTIONS[key].name}</Link>
              </h2>
              <p className="text-[.95rem] italic text-[var(--ink-soft)]">{pick(LIBRARY_SECTIONS[key].blurb, lang)}</p>
            </header>
            <ul className="list-none p-0">
              {lib[key].articles.map((a) => (
                <li key={a.slug} className="border-b border-[var(--rule)]">
                  <Link href={`/library/${key}/${a.slug}`} className="group block py-3 text-[var(--ink)]">
                    <span className="block leading-snug group-hover:text-[var(--accent)]">{pick(a.title, lang)}</span>
                    <span className="mono text-[.68rem] text-[var(--faint)]">{a.ref}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
