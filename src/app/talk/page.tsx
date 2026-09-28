import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/session';
import { getLang } from '@/lib/lang';
import { pick, t } from '@/lib/i18n';
import { TalkForm } from '@/components/forms';

export const metadata: Metadata = {
  title: 'Talk to someone',
  description: 'Ask a question, talk something through, or say you want to follow Jesus. A real person reads every message.',
};

export default async function Talk() {
  const [user, lang] = await Promise.all([getCurrentUser(), getLang()]);
  return (
    <div className="shell max-w-[40rem] pt-14">
      <p className="kicker kicker-accent">{t('navTalk', lang)}</p>
      <h1 className="mt-3 text-[clamp(2rem,1.5rem+2vw,2.8rem)] font-medium leading-tight">
        {pick({ en: 'A real person, not a funnel.', es: 'Una persona real, no un embudo de ventas.', pt: 'Uma pessoa real, não um funil.' }, lang)}
      </h1>
      <p className="mt-4 text-[1.08rem] text-[var(--ink-soft)]">
        {pick(
          {
            en: 'Ask the question you haven’t been able to ask anyone. Talk through something hard. Tell us you think you want to follow Jesus and don’t know what that means yet. Or just say hello.',
            es: 'Haz la pregunta que no has podido hacerle a nadie. Platica algo difícil. Cuéntanos que crees que quieres seguir a Jesús y todavía no sabes qué significa. O simplemente saluda.',
            pt: 'Faça a pergunta que você não conseguiu fazer a ninguém. Converse sobre algo difícil. Conte que acha que quer seguir Jesus e ainda não sabe o que isso significa. Ou só diga olá.',
          },
          lang,
        )}
      </p>
      <p className="mt-3 text-[1.02rem] text-[var(--ink-soft)]">
        {pick(
          {
            en: 'A real person reads every message. We won’t add you to a mailing list, we won’t pass on your details, and you can stop the conversation at any point.',
            es: 'Una persona real lee cada mensaje. No te vamos a agregar a una lista de correos, no vamos a compartir tus datos, y puedes terminar la conversación cuando quieras.',
            pt: 'Uma pessoa real lê cada mensagem. Não vamos colocar você numa lista de e-mails, não vamos repassar seus dados, e você pode encerrar a conversa quando quiser.',
          },
          lang,
        )}
      </p>
      <TalkForm defaultName={user?.name} defaultContact={user?.email} lang={lang} />
    </div>
  );
}
