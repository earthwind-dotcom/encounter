import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/session';
import { getLang } from '@/lib/lang';
import { pick, t } from '@/lib/i18n';
import { TalkForm } from '@/components/forms';
import { Hand, MailX, UserRound } from 'lucide-react';
import { IconTile, PageHeader } from '@/components/ui';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: pick({ en: 'Talk to someone', es: 'Habla con alguien', pt: 'Fale com alguém' }, lang),
    description: pick({ en: 'Ask a question, talk something through, or say you want to follow Jesus. A real person reads every message.', es: 'Haz una pregunta, platica algo a fondo o di que quieres seguir a Jesús. Una persona real lee cada mensaje.', pt: 'Faça uma pergunta, converse sobre algo ou diga que quer seguir Jesus. Uma pessoa real lê cada mensagem.' }, lang),
  };
}

export default async function Talk() {
  const [user, lang] = await Promise.all([getCurrentUser(), getLang()]);
  const points: [React.ReactNode, string][] = [
    [<UserRound key="u" size={17} />, pick({ en: 'A real person reads every message.', es: 'Una persona real lee cada mensaje.', pt: 'Uma pessoa real lê cada mensagem.' }, lang)],
    [<MailX key="m" size={17} />, pick({ en: 'No mailing list, and we never pass on your details.', es: 'Sin listas de correo, y nunca compartimos tus datos.', pt: 'Sem lista de e-mails, e nunca repassamos seus dados.' }, lang)],
    [<Hand key="h" size={17} />, pick({ en: 'You can stop the conversation at any point.', es: 'Puedes terminar la conversación cuando quieras.', pt: 'Você pode encerrar a conversa quando quiser.' }, lang)],
  ];
  return (
    <div className="shell grid items-start gap-10 lg:grid-cols-[1fr_minmax(0,520px)] lg:gap-16">
      <PageHeader
        kicker={t('navTalk', lang)}
        title={pick({ en: 'A real person, not a funnel.', es: 'Una persona real, no un embudo de ventas.', pt: 'Uma pessoa real, não um funil.' }, lang)}
        dek={pick(
          {
            en: 'Ask the question you haven’t been able to ask anyone. Talk through something hard. Tell us you think you want to follow Jesus and don’t know what that means yet. Or just say hello.',
            es: 'Haz la pregunta que no has podido hacerle a nadie. Platica algo difícil. Cuéntanos que crees que quieres seguir a Jesús y todavía no sabes qué significa. O simplemente saluda.',
            pt: 'Faça a pergunta que você não conseguiu fazer a ninguém. Converse sobre algo difícil. Conte que acha que quer seguir Jesus e ainda não sabe o que isso significa. Ou só diga olá.',
          },
          lang,
        )}
      >
        <ul className="sans mt-8 list-none space-y-3 p-0">
          {points.map(([icon, text]) => (
            <li key={text} className="flex items-center gap-3 text-[.95rem] text-[var(--ink-soft)]">
              <IconTile className="!h-9 !w-9 !rounded-xl">{icon}</IconTile> {text}
            </li>
          ))}
        </ul>
      </PageHeader>
      <div className="glass-strong rise rise-1 rounded-[28px] p-6 sm:p-9 lg:mt-16">
        <TalkForm defaultName={user?.name} defaultContact={user?.email} lang={lang} />
      </div>
    </div>
  );
}
