import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { SignUpForm } from '@/components/forms';
import { getLang } from '@/lib/lang';
import { pick } from '@/lib/i18n';

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
    <div className="shell max-w-md pt-16">
      <p className="kicker kicker-accent">Encounter</p>
      <h1 className="mt-3 text-[2.2rem] font-medium leading-tight">{pick({ en: 'Keep your place.', es: 'Guarda tu lugar.', pt: 'Guarde seu lugar.' }, lang)}</h1>
      <p className="mt-3 text-[1.02rem] text-[var(--ink-soft)]">
        {pick(
          {
            en: 'An account saves where you are in the course and keeps private notes on anything you read. Everything on Encounter is readable without one.',
            es: 'Una cuenta guarda dónde vas en el curso y tus notas privadas sobre lo que lees. Todo en Encounter se puede leer sin cuenta.',
            pt: 'Uma conta guarda onde você está no curso e suas notas privadas sobre o que lê. Tudo no Encounter pode ser lido sem conta.',
          },
          lang,
        )}
      </p>
      <SignUpForm next={next} lang={lang} />
    </div>
  );
}
