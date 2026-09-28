import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { getLibrary, getLibraryArticle } from '@/lib/content';
import { t } from '@/lib/i18n';
import { LegacyArticle } from '@/components/legacy-article';

export function generateStaticParams() {
  return getLibrary().colophon.articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = getLibraryArticle('colophon', (await params).slug);
  return a ? { title: a.title.en } : {};
}

export default async function AboutArticle({ params }: { params: Promise<{ slug: string }> }) {
  const lang = await getLang();
  return <LegacyArticle section="colophon" base="/about" slug={(await params).slug} label={t('navAbout', lang)} lang={lang} track={false} />;
}
