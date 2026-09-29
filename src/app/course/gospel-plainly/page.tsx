import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireFacilitator } from '@/lib/session';
import { getFacilitatorDoc } from '@/lib/content';
import { getLang } from '@/lib/lang';
import { pick, t } from '@/lib/i18n';

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
    <div className="shell pt-12" lang={doc.lang}>
      <p className="kicker">
        <Link href="/facilitate" className="kicker kicker-accent">{t('desk', lang)}</Link> · {pick({ en: 'guide', es: 'guía', pt: 'guia' }, lang)}
      </p>
      <h1 className="mt-3 text-[2.4rem] font-medium">{doc.title}</h1>
      <div className="prose mt-8" dangerouslySetInnerHTML={{ __html: doc.html }} />
    </div>
  );
}
