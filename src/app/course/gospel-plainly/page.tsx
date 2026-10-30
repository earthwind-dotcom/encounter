import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireFacilitator } from '@/lib/session';
import { getFacilitatorDoc } from '@/lib/content';
import { getLang } from '@/lib/lang';
import { pick, t } from '@/lib/i18n';
import { PageHeader } from '@/components/ui';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return { title: pick({ en: 'The Gospel, Plainly (facilitators)', es: 'El evangelio, en claro (facilitadores)', pt: 'O evangelho, com clareza (facilitadores)' }, lang), robots: { index: false } };
}

/** The facilitators' presentation. The reader-facing version is /course/pathway/offer. */
export default async function GospelPlainly() {
  await requireFacilitator();
  const lang = await getLang();
  const doc = getFacilitatorDoc('gospel-plainly', lang);
  if (!doc) notFound();
  return (
    <div className="shell" lang={doc.lang}>
      <PageHeader crumb={{ href: '/facilitate', label: t('desk', lang) }} kicker={pick({ en: 'Guide', es: 'Guía', pt: 'Guia' }, lang)} title={doc.title} />
      <div className="glass rise rise-1 mt-10 rounded-[24px] p-6 sm:p-10">
        <div className="prose" dangerouslySetInnerHTML={{ __html: doc.html }} />
      </div>
    </div>
  );
}
