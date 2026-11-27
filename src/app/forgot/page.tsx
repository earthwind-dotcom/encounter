import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { ForgotForm } from '@/components/forms';
import { emailEnabled } from '@/lib/email';
import { getLang } from '@/lib/lang';
import { pick } from '@/lib/i18n';
import { AuthShell } from '@/components/auth-shell';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return { title: pick({ en: 'Forgot your password', es: 'Olvidé mi contraseña', pt: 'Esqueci minha senha' }, lang), robots: { index: false } };
}

export default async function Forgot() {
  if (await getCurrentUser()) redirect('/account');
  const lang = await getLang();
  return (
    <AuthShell
      title={pick({ en: 'It happens.', es: 'Pasa.', pt: 'Acontece.' }, lang)}
      intro={pick(
        {
          en: 'Give us the email you signed up with and we’ll send a link to choose a new password.',
          es: 'Danos el correo con el que te registraste y te enviaremos un enlace para elegir una contraseña nueva.',
          pt: 'Informe o e-mail que você usou no cadastro e enviaremos um link para escolher uma nova senha.',
        },
        lang,
      )}
    >
      {emailEnabled() || process.env.NODE_ENV !== 'production' ? (
        <ForgotForm lang={lang} />
      ) : (
        // No email provider yet: an admin issues the link by hand.
        <p className="mt-6 text-[var(--ink-soft)] lg:mt-0">
          {pick({ en: 'Email isn’t switched on yet.', es: 'El correo todavía no está activado.', pt: 'O e-mail ainda não está ativado.' }, lang)}{' '}
          <Link href="/talk">{pick({ en: 'Tell us', es: 'Avísanos', pt: 'Avise-nos' }, lang)}</Link>{' '}
          {pick({ en: 'and a real person will send you a link.', es: 'y una persona real te enviará un enlace.', pt: 'e uma pessoa real enviará um link.' }, lang)}
        </p>
      )}
    </AuthShell>
  );
}
