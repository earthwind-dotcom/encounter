import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { SignUpForm } from '@/components/forms';
import { getLang } from '@/lib/lang';
import { pick } from '@/lib/i18n';
import { AuthShell } from '@/components/auth-shell';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: pick({ en: 'Create an account', es: 'Crear una cuenta', pt: 'Criar uma conta' }, lang), robots: { index: false },
  };
}

export default async function SignUp({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = (await searchParams).next ?? '/account';
  if (await getCurrentUser()) redirect('/account');
  const lang = await getLang();
  return (
    <AuthShell
      title={pick({ en: 'Keep your place.', es: 'Guarda tu lugar.', pt: 'Guarde seu lugar.' }, lang)}
      intro={pick(
        {
          en: 'An account saves where you are in the course and keeps private notes on anything you read. Everything on Encounter is readable without one.',
          es: 'Una cuenta guarda dónde vas en el curso y tus notas privadas sobre lo que lees. Todo en Encounter se puede leer sin cuenta.',
          pt: 'Uma conta guarda onde você está no curso e suas notas privadas sobre o que lê. Tudo no Encounter pode ser lido sem conta.',
        },
        lang,
      )}
      points={[
        pick({ en: 'Your progress through all thirteen sessions', es: 'Tu avance en las trece sesiones', pt: 'Seu progresso nas treze sessões' }, lang),
        pick({ en: 'Private notes nobody else can read', es: 'Notas privadas que nadie más puede leer', pt: 'Notas privadas que ninguém mais pode ler' }, lang),
        pick({ en: 'Join a group with a code from your facilitator', es: 'Únete a un grupo con el código de tu facilitador', pt: 'Entre em um grupo com o código do seu facilitador' }, lang),
        pick({ en: 'No mailing list. Delete everything any time.', es: 'Sin listas de correo. Borra todo cuando quieras.', pt: 'Sem lista de e-mails. Apague tudo quando quiser.' }, lang),
      ]}
    >
      <SignUpForm next={next} lang={lang} />
    </AuthShell>
  );
}
