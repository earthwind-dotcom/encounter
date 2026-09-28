import { notFound, redirect } from 'next/navigation';
import { getLibrary, isLibraryKey } from '@/lib/content';

export function generateStaticParams() {
  return ['reflections', 'roots', 'provenance', 'wonder'].map((section) => ({ section }));
}

/** A section's landing is its first entry, as it was on Marginalia. */
export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!isLibraryKey(section) && section !== 'wonder') notFound();
  const first = getLibrary()[section]?.articles[0];
  if (!first) notFound();
  redirect(`/library/${section}/${first.slug}`);
}
