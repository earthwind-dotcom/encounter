import type { Metadata } from 'next';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { checkPasswordReset } from '@/lib/auth';
import { ResetForm } from '@/components/reset-form';
import { getLang } from '@/lib/lang';
import { pick } from '@/lib/i18n';

const TITLE = { en: 'Choose a new password', es: 'Elige una contraseña nueva', pt: 'Escolha uma senha nova' };

export async function generateMetadata(): Promise<Metadata> {
  return { title: pick(TITLE, await getLang()), robots: { index: false } };
}


export default async function Reset({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const user = await checkPasswordReset(await getDb(), token);
  const lang = await getLang();
  return (
    <div className="shell max-w-md pt-16">
      <p className="kicker kicker-accent">Encounter</p>
      {user ? (
        <>
          <h1 className="mt-3 text-[2.2rem] font-medium leading-tight">
            {pick({ en: `New password, ${user.name}.`, es: `Contraseña nueva, ${user.name}.`, pt: `Senha nova, ${user.name}.` }, lang)}
          </h1>
          <p className="mt-2 text-[var(--ink-soft)]">
            {pick(
              {
                en: 'This link works once. Choosing a password signs you out on other devices.',
                es: 'Este enlace funciona una sola vez. Al elegir una contraseña se cierra tu sesión en otros dispositivos.',
                pt: 'Este link funciona uma única vez. Ao escolher uma senha, sua sessão é encerrada em outros dispositivos.',
              },
              lang,
            )}
          </p>
          <ResetForm token={token} lang={lang} />
        </>
      ) : (
        <>
          <h1 className="mt-3 text-[2.2rem] font-medium leading-tight">
            {pick({ en: 'This link has run out.', es: 'Este enlace ya venció.', pt: 'Este link expirou.' }, lang)}
          </h1>
          <p className="mt-2 text-[var(--ink-soft)]">
            {pick({ en: 'Reset links work once and last a day.', es: 'Los enlaces funcionan una vez y duran un día.', pt: 'Os links funcionam uma vez e duram um dia.' }, lang)}{' '}
            <Link href="/talk">{pick({ en: 'Ask us', es: 'Pídenos', pt: 'Peça' }, lang)}</Link>{' '}
            {pick({ en: 'for a new one.', es: 'uno nuevo.', pt: 'um novo.' }, lang)}
          </p>
        </>
      )}
    </div>
  );
}
