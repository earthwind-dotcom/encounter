import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLang } from '@/lib/lang';
import { getLibrary, getLibraryArticle, isLibraryKey, LIBRARY_SECTIONS } from '@/lib/content';
import { t } from '@/lib/i18n';
import { LegacyArticle } from '@/components/legacy-article';

// Wonder (children's) is reachable but not listed, as on Marginalia, until its research pass is done.
const SECTIONS = ['reflections', 'roots', 'provenance', 'wonder'] as const;

export function generateStaticParams() {
  const lib = getLibrary();
  return SECTIONS.flatMap((section) => lib[section].articles.map((a) => ({ section, slug: a.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string; slug: string }> }): Promise<Metadata> {
  const { section, slug } = await params;
  const a = getLibraryArticle(section, slug);
  return a ? { title: a.title.en, description: a.text.slice(0, 160), openGraph: { type: 'article', title: a.title.en } } : {};
}

export default async function LibraryArticlePage({ params }: { params: Promise<{ section: string; slug: string }> }) {
  const { section, slug } = await params;
  if (!(SECTIONS as readonly string[]).includes(section)) notFound();
  const lang = await getLang();
  const label = isLibraryKey(section) ? LIBRARY_SECTIONS[section].name : 'Wonder';
  return (
    <LegacyArticle
      section={section}
      base={`/library/${section}`}
      slug={slug}
      label={label}
      parent={{ href: '/library', label: t('navLibrary', lang) }}
      lang={lang}
      track={section !== 'wonder'}
    />
  );
}
