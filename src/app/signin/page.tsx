import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { SignInForm } from '@/components/forms';
import { getLang } from '@/lib/lang';
import { pick } from '@/lib/i18n';
import { AuthShell } from '@/components/auth-shell';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: pick({ en: 'Sign in', es: 'Entrar', pt: 'Entrar' }, lang), robots: { index: false },
  };
}

export default async function SignIn({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = (await searchParams).next ?? '/account';
  if (await getCurrentUser()) redirect(next.startsWith('/') ? next : '/account');
  const lang = await getLang();
  return (
    <AuthShell
      title={pick({ en: 'Welcome back.', es: 'Qué bueno verte de nuevo.', pt: 'Que bom ver você de novo.' }, lang)}
      intro={pick({ en: 'Pick up where you left off: your place in the course, your notes, and your group.', es: 'Sigue donde te quedaste: tu lugar en el curso, tus notas y tu grupo.', pt: 'Continue de onde parou: seu lugar no curso, suas notas e seu grupo.' }, lang)}
    >
      <SignInForm next={next} lang={lang} />
    </AuthShell>
  );
}
