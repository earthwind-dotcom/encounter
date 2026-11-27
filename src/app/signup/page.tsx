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
  if (await getCurrentUser()) redirect(next.startsWith('/') && !next.startsWith('//') ? next : '/account');
  const lang = await getLang();
  return (
    <AuthShell
      title={pick({ en: 'Come on in.', es: 'Adelante.', pt: 'Pode entrar.' }, lang)}
      intro={pick(
        {
          en: 'A free account opens the whole course, every full answer and the research library, and keeps your place and private notes as you go. It takes a minute.',
          es: 'Una cuenta gratis abre todo el curso, cada respuesta completa y la biblioteca de investigación, y guarda dónde vas y tus notas privadas. Toma un minuto.',
          pt: 'Uma conta grátis abre todo o curso, cada resposta completa e a biblioteca de pesquisa, e guarda onde você está e suas notas privadas. Leva um minuto.',
        },
        lang,
      )}
      points={[
        pick({ en: 'All thirteen sessions, with your progress saved', es: 'Las trece sesiones, con tu avance guardado', pt: 'As treze sessões, com seu progresso salvo' }, lang),
        pick({ en: 'Every hard question, answered in full, and the library', es: 'Cada pregunta difícil, respondida completa, y la biblioteca', pt: 'Cada pergunta difícil, respondida por inteiro, e a biblioteca' }, lang),
        pick({ en: 'Private notes nobody else can read', es: 'Notas privadas que nadie más puede leer', pt: 'Notas privadas que ninguém mais pode ler' }, lang),
        pick({ en: 'Join a group with a code from your facilitator', es: 'Únete a un grupo con el código de tu facilitador', pt: 'Entre em um grupo com o código do seu facilitador' }, lang),
        pick({ en: 'No mailing list. Delete everything any time.', es: 'Sin listas de correo. Borra todo cuando quieras.', pt: 'Sem lista de e-mails. Apague tudo quando quiser.' }, lang),
      ]}
    >
      <SignUpForm next={next} lang={lang} />
    </AuthShell>
  );
}
