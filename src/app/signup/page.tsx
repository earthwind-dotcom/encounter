import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { SignUpForm } from '@/components/forms';

export const metadata: Metadata = { title: 'Create an account', robots: { index: false } };

export default async function SignUp({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = (await searchParams).next ?? '/account';
  if (await getCurrentUser()) redirect('/account');
  return (
    <div className="shell max-w-md pt-16">
      <p className="kicker kicker-accent">Encounter</p>
      <h1 className="mt-3 text-[2.2rem] font-medium leading-tight">Keep your place.</h1>
      <p className="mt-3 text-[1.02rem] text-[var(--ink-soft)]">
        An account saves where you are in the course and keeps private notes on anything you read. Everything on Encounter is readable without
        one.
      </p>
      <SignUpForm next={next} />
    </div>
  );
}
