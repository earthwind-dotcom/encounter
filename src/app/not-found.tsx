import Link from 'next/link';
import { getLang } from '@/lib/lang';
import { pick, t } from '@/lib/i18n';

export default async function NotFound() {
  const lang = await getLang();
  return (
    <div className="shell max-w-xl pt-20">
      <p className="kicker kicker-accent">{pick({ en: 'Not found', es: 'No encontrado', pt: 'Não encontrado' }, lang)}</p>
      <h1 className="mt-3 text-[2.4rem] font-medium leading-tight">
        {pick({ en: 'That page isn’t here.', es: 'Esa página no está aquí.', pt: 'Essa página não está aqui.' }, lang)}
      </h1>
      <p className="mt-3 text-[var(--ink-soft)]">
        {pick(
          {
            en: 'If you followed a link from the old Marginalia site, everything moved into the',
            es: 'Si seguiste un enlace del antiguo sitio Marginalia, todo se mudó a la',
            pt: 'Se você seguiu um link do antigo site Marginalia, tudo foi para a',
          },
          lang,
        )}{' '}
        <Link href="/library">{t('navLibrary', lang)}</Link>.
      </p>
      <p className="mt-6">
        <Link href="/" className="btn">{pick({ en: 'Back to the start', es: 'Volver al inicio', pt: 'Voltar ao início' }, lang)}</Link>
      </p>
    </div>
  );
}
