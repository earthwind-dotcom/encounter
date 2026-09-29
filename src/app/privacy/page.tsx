import type { Metadata } from 'next';
import Link from 'next/link';
import { getLang } from '@/lib/lang';
import { pick, type Lang } from '@/lib/i18n';

type L = Record<Lang, string>;
const TITLE: L = { en: 'Privacy', es: 'Privacidad', pt: 'Privacidade' };

export async function generateMetadata(): Promise<Metadata> {
  return { title: pick(TITLE, await getLang()) };
}

/** The notice, one block per language. Portuguese follows the Spanish structure. */
const COPY = {
  heading: { en: 'What we keep, and why', es: 'Qué guardamos, y por qué', pt: 'O que guardamos, e por quê' },
  intro: {
    en: 'Faith is personal, and some of what people bring here is the most private thing they have. We keep as little as we can, we never sell or share it, and you can delete it.',
    es: 'La fe es algo personal, y parte de lo que la gente trae aquí es lo más privado que tiene. Guardamos lo menos posible, nunca lo vendemos ni lo compartimos, y puedes borrarlo.',
    pt: 'A fé é pessoal, e parte do que as pessoas trazem aqui é o que elas têm de mais íntimo. Guardamos o mínimo possível, nunca vendemos nem compartilhamos, e você pode apagar.',
  },
  reading: { en: 'Reading', es: 'Leer', pt: 'Ler' },
  readingP: {
    en: 'Everything on Encounter can be read without an account. We don’t run advertising trackers.',
    es: 'Todo en Encounter se puede leer sin cuenta. No usamos rastreadores de publicidad.',
    pt: 'Tudo no Encounter pode ser lido sem conta. Não usamos rastreadores de publicidade.',
  },
  account: { en: 'If you create an account', es: 'Si creas una cuenta', pt: 'Se você criar uma conta' },
  a1b: { en: 'Your name, email and a scrambled form of your password.', es: 'Tu nombre, tu correo y una forma cifrada de tu contraseña.', pt: 'Seu nome, seu e-mail e uma forma cifrada da sua senha.' },
  a1: { en: 'We can’t see your password.', es: 'No podemos ver tu contraseña.', pt: 'Não conseguimos ver sua senha.' },
  a2b: { en: 'What you’ve marked as done', es: 'Lo que has marcado como hecho', pt: 'O que você marcou como feito' },
  a2: { en: ', so we can show you where you are.', es: ', para mostrarte dónde vas.', pt: ', para mostrar onde você está.' },
  a3b: { en: 'Your notes.', es: 'Tus notas.', pt: 'Suas notas.' },
  a3: { en: 'Private to you. Facilitators and admins can’t read them in the app.', es: 'Son solo tuyas. Ni los facilitadores ni los administradores pueden leerlas en la aplicación.', pt: 'São só suas. Facilitadores e administradores não podem lê-las no aplicativo.' },
  a4b: { en: 'Where you are with following Jesus', es: 'Dónde estás en cuanto a seguir a Jesús', pt: 'Onde você está em relação a seguir Jesus' },
  a4: { en: ', only if you choose to say. It’s for you, not a scoreboard.', es: ', solo si decides decirlo. Es para ti, no es un marcador.', pt: ', só se você quiser dizer. É para você, não um placar.' },
  group: { en: 'If you join a group', es: 'Si te unes a un grupo', pt: 'Se você entrar em um grupo' },
  groupP: {
    en: 'The group’s facilitator can see your name and which course sessions you’ve marked done. Not your notes, and not your answer to where you are with following Jesus. You can leave a group at any time from your page.',
    es: 'El facilitador del grupo puede ver tu nombre y qué sesiones del curso marcaste como hechas. No tus notas, ni tu respuesta sobre dónde estás en cuanto a seguir a Jesús. Puedes salir de un grupo cuando quieras desde tu página.',
    pt: 'O facilitador do grupo pode ver seu nome e quais sessões do curso você marcou como feitas. Não suas notas, nem sua resposta sobre onde você está em relação a seguir Jesus. Você pode sair de um grupo quando quiser pela sua página.',
  },
  message: { en: 'If you send a message', es: 'Si envías un mensaje', pt: 'Se você enviar uma mensagem' },
  messageP: {
    en: 'We keep your name, how to reach you, and what you wrote, so someone can reply. Only the people who answer messages can see them.',
    es: 'Guardamos tu nombre, cómo contactarte y lo que escribiste, para que alguien pueda responderte. Solo las personas que responden los mensajes pueden verlos.',
    pt: 'Guardamos seu nome, como falar com você e o que você escreveu, para que alguém possa responder. Só as pessoas que respondem às mensagens podem vê-las.',
  },
  cookies: { en: 'Cookies', es: 'Cookies', pt: 'Cookies' },
  cookiesP: {
    en: 'One to keep you signed in, one to remember your language. Your light or dark choice stays in your own browser.',
    es: 'Una para mantener tu sesión abierta y otra para recordar tu idioma. Tu elección de modo claro u oscuro se queda en tu propio navegador.',
    pt: 'Um para manter você conectado e outro para lembrar seu idioma. Sua escolha de modo claro ou escuro fica no seu próprio navegador.',
  },
  deleting: { en: 'Deleting everything', es: 'Borrar todo', pt: 'Apagar tudo' },
  del1: { en: 'You can delete your account from', es: 'Puedes borrar tu cuenta desde', pt: 'Você pode excluir sua conta pela' },
  yourPage: { en: 'your page', es: 'tu página', pt: 'sua página' },
  del2: {
    en: 'at any time. That removes your account, progress, notes and stage at once. Messages you sent are kept so the conversation can be closed properly, but they’re no longer linked to an account; ask and we’ll remove them too.',
    es: 'cuando quieras. Eso elimina de una vez tu cuenta, tu avance, tus notas y tu etapa. Los mensajes que enviaste se conservan para poder cerrar bien la conversación, pero ya no quedan ligados a ninguna cuenta; pídelo y también los borramos.',
    pt: 'quando quiser. Isso remove de uma vez sua conta, seu progresso, suas notas e sua etapa. As mensagens que você enviou ficam guardadas para encerrar bem a conversa, mas deixam de estar ligadas a uma conta; peça e também as apagamos.',
  },
  review: {
    en: 'This notice will be reviewed before Encounter is promoted publicly, including for the data-protection law where it is operated.',
    es: 'Este aviso se revisará antes de promover Encounter públicamente, incluida la ley de protección de datos del lugar donde opere.',
    pt: 'Este aviso será revisado antes de o Encounter ser divulgado publicamente, incluindo a lei de proteção de dados do lugar onde operar.',
  },
} satisfies Record<string, L>;

export default async function Privacy() {
  const lang = await getLang();
  const c = (k: keyof typeof COPY) => pick(COPY[k], lang);
  return (
    <div className="shell pt-14">
      <div className="prose">
        <p className="kicker kicker-accent">{pick(TITLE, lang)}</p>
        <h1 className="text-[2.4rem] font-medium leading-tight">{c('heading')}</h1>
        <p>{c('intro')}</p>
        <h2>{c('reading')}</h2>
        <p>{c('readingP')}</p>
        <h2>{c('account')}</h2>
        <ul>
          <li><strong>{c('a1b')}</strong> {c('a1')}</li>
          <li><strong>{c('a2b')}</strong>{c('a2')}</li>
          <li><strong>{c('a3b')}</strong> {c('a3')}</li>
          <li><strong>{c('a4b')}</strong>{c('a4')}</li>
        </ul>
        <h2>{c('group')}</h2>
        <p>{c('groupP')}</p>
        <h2>{c('message')}</h2>
        <p>{c('messageP')}</p>
        <h2>{c('cookies')}</h2>
        <p>{c('cookiesP')}</p>
        <h2>{c('deleting')}</h2>
        <p>
          {c('del1')} <Link href="/account">{c('yourPage')}</Link> {c('del2')}
        </p>
        <p className="text-[var(--faint)] italic">{c('review')}</p>
      </div>
    </div>
  );
}
