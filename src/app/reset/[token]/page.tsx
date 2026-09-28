import type { Metadata } from 'next';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { checkPasswordReset } from '@/lib/auth';
import { ResetForm } from '@/components/reset-form';

export const metadata: Metadata = { title: 'Choose a new password', robots: { index: false } };

export default async function Reset({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const user = await checkPasswordReset(await getDb(), token);
  return (
    <div className="shell max-w-md pt-16">
      <p className="kicker kicker-accent">Encounter</p>
      {user ? (
        <>
          <h1 className="mt-3 text-[2.2rem] font-medium leading-tight">New password, {user.name}.</h1>
          <p className="mt-2 text-[var(--ink-soft)]">This link works once. Choosing a password signs you out on other devices.</p>
          <ResetForm token={token} />
        </>
      ) : (
        <>
          <h1 className="mt-3 text-[2.2rem] font-medium leading-tight">This link has run out.</h1>
          <p className="mt-2 text-[var(--ink-soft)]">
            Reset links work once and last a day. <Link href="/talk">Ask us</Link> for a new one.
          </p>
        </>
      )}
    </div>
  );
}
