import { requireMember } from '@/lib/session';
import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { getLibrary, getLibraryArticle } from '@/lib/content';
import { t } from '@/lib/i18n';
import { LegacyArticle } from '@/components/legacy-article';

/** Pathway pages anyone can read, signed in or not. */
const PUBLIC_PATHWAY = new Set(['offer']);

export function generateStaticParams() {
  return getLibrary().encounter.articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = getLibraryArticle('encounter', (await params).slug);
  return a ? { title: a.title.en, description: a.text.slice(0, 160) } : {};
}

export default async function PathwayPage({ params }: { params: Promise<{ slug: string }> }) {
  // "What it means, in plain words" stays open to anyone: the invitation is never behind a login.
  const { slug: gateSlug } = await params;
  if (!PUBLIC_PATHWAY.has(gateSlug)) await requireMember(`/course/pathway/${gateSlug}`);
  const lang = await getLang();
  return (
    <LegacyArticle
      section="encounter"
      base="/course/pathway"
      slug={(await params).slug}
      label="Pathway"
      parent={{ href: '/course', label: t('navCourse', lang) }}
      lang={lang}
      track={false}
    />
  );
}
