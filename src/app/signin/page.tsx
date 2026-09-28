import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { SignInForm } from '@/components/forms';
import { getLang } from '@/lib/lang';
import { pick } from '@/lib/i18n';

export const metadata: Metadata = { title: 'Sign in', robots: { index: false } };

export default async function SignIn({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = (await searchParams).next ?? '/account';
  if (await getCurrentUser()) redirect(next.startsWith('/') ? next : '/account');
  const lang = await getLang();
  return (
    <div className="shell max-w-md pt-16">
      <p className="kicker kicker-accent">Encounter</p>
      <h1 className="mt-3 text-[2.2rem] font-medium leading-tight">{pick({ en: 'Welcome back.', es: 'Qué bueno verte de nuevo.', pt: 'Que bom ver você de novo.' }, lang)}</h1>
      <SignInForm next={next} lang={lang} />
    </div>
  );
}
