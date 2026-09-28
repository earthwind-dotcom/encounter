import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireFacilitator } from '@/lib/session';
import { getFacilitatorDoc } from '@/lib/content';

export const metadata: Metadata = { title: 'The Gospel, Plainly (facilitators)', robots: { index: false } };

/** The facilitators' presentation. The reader-facing version is /course/pathway/offer. */
export default async function GospelPlainly() {
  await requireFacilitator();
  const doc = getFacilitatorDoc('gospel-plainly');
  if (!doc) notFound();
  return (
    <div className="shell pt-12">
      <p className="kicker"><Link href="/facilitate" className="kicker kicker-accent">Facilitator desk</Link> · guide</p>
      <h1 className="mt-3 text-[2.4rem] font-medium">{doc.title}</h1>
      <div className="prose mt-8" dangerouslySetInnerHTML={{ __html: doc.html }} />
    </div>
  );
}
