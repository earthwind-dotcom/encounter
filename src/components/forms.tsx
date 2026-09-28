'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { requestConversation, signIn, signUp, type FormState } from '@/app/actions';
import type { Lang } from '@/lib/i18n';

const COPY = {
  email: { en: 'Email', es: 'Correo', pt: 'E-mail' },
  password: { en: 'Password', es: 'Contraseña', pt: 'Senha' },
  signIn: { en: 'Sign in', es: 'Entrar', pt: 'Entrar' },
  signingIn: { en: 'Signing in…', es: 'Entrando…', pt: 'Entrando…' },
  newHere: { en: 'New here?', es: '¿Eres nuevo?', pt: 'É novo aqui?' },
  createOne: { en: 'Create an account', es: 'Crea una cuenta', pt: 'Crie uma conta' },
  noNeed: { en: 'You don’t need one to read anything.', es: 'No necesitas una para leer nada.', pt: 'Você não precisa de uma para ler nada.' },
  forgot: { en: 'Forgot your password?', es: '¿Olvidaste tu contraseña?', pt: 'Esqueceu a senha?' },
  tellUs: { en: 'Tell us', es: 'Avísanos', pt: 'Avise-nos' },
  forgotRest: { en: 'and we’ll send you a link to choose a new one.', es: 'y te enviaremos un enlace para elegir una nueva.', pt: 'e enviaremos um link para escolher uma nova.' },
  callYou: { en: 'What should we call you?', es: '¿Cómo te llamamos?', pt: 'Como devemos chamar você?' },
  pw10: { en: 'Password (10+ characters)', es: 'Contraseña (10 caracteres o más)', pt: 'Senha (10 caracteres ou mais)' },
  agreeData: { en: 'I agree to how Encounter handles my data, as set out in the', es: 'Acepto cómo Encounter maneja mis datos, según el', pt: 'Concordo com a forma como o Encounter trata meus dados, conforme o' },
  privacyNotice: { en: 'privacy notice', es: 'aviso de privacidad', pt: 'aviso de privacidade' },
  notesPrivate: { en: 'Your notes are private to you.', es: 'Tus notas son privadas.', pt: 'Suas notas são privadas.' },
  create: { en: 'Create account', es: 'Crear cuenta', pt: 'Criar conta' },
  creating: { en: 'Creating…', es: 'Creando…', pt: 'Criando…' },
  haveOne: { en: 'Already have one?', es: '¿Ya tienes una?', pt: 'Já tem uma?' },
  thanks: { en: 'Thank you. A real person will read this and get back to you.', es: 'Gracias. Una persona real lo va a leer y te va a responder.', pt: 'Obrigado. Uma pessoa real vai ler e responder.' },
  danger: {
    en: 'If you’re in danger or thinking about ending your life, please don’t wait for us: call or text your local emergency number, or 988 in the United States.',
    es: 'Si estás en peligro o pensando en quitarte la vida, por favor no esperes nuestra respuesta: llama a tu número local de emergencias (911 en México), o al 988 en Estados Unidos.',
    pt: 'Se você está em perigo ou pensando em tirar a própria vida, não espere por nós: ligue para o número de emergência local, ou para o CVV (188) no Brasil.',
  },
  yourName: { en: 'Your name (or what we should call you)', es: 'Tu nombre (o cómo te llamamos)', pt: 'Seu nome (ou como devemos chamar você)' },
  contact: { en: 'Email or phone, so we can reply', es: 'Correo o teléfono, para poder responderte', pt: 'E-mail ou telefone, para podermos responder' },
  about: { en: 'What’s it about? (optional)', es: '¿De qué se trata? (opcional)', pt: 'Sobre o que é? (opcional)' },
  message: { en: 'Your message', es: 'Tu mensaje', pt: 'Sua mensagem' },
  agreeMsg: { en: 'I agree that Encounter can store this message to reply to me, as set out in the', es: 'Acepto que Encounter guarde este mensaje para responderme, según el', pt: 'Concordo que o Encounter guarde esta mensagem para me responder, conforme o' },
  send: { en: 'Send', es: 'Enviar', pt: 'Enviar' },
  sending: { en: 'Sending…', es: 'Enviando…', pt: 'Enviando…' },
  leaveEmpty: { en: 'Leave this empty', es: 'Deja esto vacío', pt: 'Deixe isto vazio' },
} satisfies Record<string, Record<Lang, string>>;

const TOPICS: [string, Record<Lang, string>][] = [
  ['', { en: 'Just want to talk', es: 'Solo quiero platicar', pt: 'Só quero conversar' }],
  ['question', { en: 'A question I can’t get past', es: 'Una pregunta que no logro superar', pt: 'Uma pergunta que não consigo superar' }],
  ['follow', { en: 'I think I want to follow Jesus', es: 'Creo que quiero seguir a Jesús', pt: 'Acho que quero seguir Jesus' }],
  ['church', { en: 'Finding a church or a group', es: 'Encontrar una iglesia o un grupo', pt: 'Encontrar uma igreja ou um grupo' }],
  ['hurt', { en: 'Something painful', es: 'Algo doloroso', pt: 'Algo doloroso' }],
  ['course', { en: 'Joining or running the course', es: 'Unirme al curso o dirigirlo', pt: 'Participar ou conduzir o curso' }],
];

export function SignInForm({ next, lang }: { next: string; lang: Lang }) {
  const c = (k: keyof typeof COPY) => COPY[k][lang];
  const [state, action, pending] = useActionState<FormState, FormData>(signIn, undefined);
  return (
    <form action={action} className="mt-8">
      <input type="hidden" name="next" value={next} />
      <label className="field"><span>{c('email')}</span><input className="input" name="email" type="email" autoComplete="email" required /></label>
      <label className="field"><span>{c('password')}</span><input className="input" name="password" type="password" autoComplete="current-password" required /></label>
      {state?.error && <p className="error" role="alert">{state.error}</p>}
      <button className="btn mt-2" disabled={pending}>{pending ? c('signingIn') : c('signIn')}</button>
      <p className="mt-6 text-[.95rem] text-[var(--ink-soft)]">
        {c('newHere')} <Link href={`/signup?next=${encodeURIComponent(next)}`}>{c('createOne')}</Link>. {c('noNeed')}
      </p>
      <p className="mt-2 text-[.95rem] text-[var(--ink-soft)]">
        {c('forgot')} <Link href="/talk">{c('tellUs')}</Link> {c('forgotRest')}
      </p>
    </form>
  );
}

export function SignUpForm({ next, lang }: { next: string; lang: Lang }) {
  const c = (k: keyof typeof COPY) => COPY[k][lang];
  const [state, action, pending] = useActionState<FormState, FormData>(signUp, undefined);
  return (
    <form action={action} className="mt-8">
      <input type="hidden" name="next" value={next} />
      <label className="field"><span>{c('callYou')}</span><input className="input" name="name" autoComplete="given-name" required maxLength={80} /></label>
      <label className="field"><span>{c('email')}</span><input className="input" name="email" type="email" autoComplete="email" required /></label>
      <label className="field"><span>{c('pw10')}</span><input className="input" name="password" type="password" autoComplete="new-password" minLength={10} required /></label>
      <label className="mb-4 flex gap-3 text-[.95rem] leading-snug text-[var(--ink-soft)]">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span>
          {c('agreeData')} <Link href="/privacy">{c('privacyNotice')}</Link>. {c('notesPrivate')}
        </span>
      </label>
      {state?.error && <p className="error" role="alert">{state.error}</p>}
      <button className="btn mt-2" disabled={pending}>{pending ? c('creating') : c('create')}</button>
      <p className="mt-6 text-[.95rem] text-[var(--ink-soft)]">
        {c('haveOne')} <Link href={`/signin?next=${encodeURIComponent(next)}`}>{c('signIn')}</Link>.
      </p>
    </form>
  );
}

export function TalkForm({ defaultName = '', defaultContact = '', lang }: { defaultName?: string; defaultContact?: string; lang: Lang }) {
  const c = (k: keyof typeof COPY) => COPY[k][lang];
  const [state, action, pending] = useActionState<FormState, FormData>(requestConversation, undefined);
  if (state?.ok) {
    return (
      <div className="card mt-8 p-6" role="status">
        <p className="text-[1.15rem]">{c('thanks')}</p>
        <p className="mt-2 text-[.95rem] text-[var(--ink-soft)]">{c('danger')}</p>
      </div>
    );
  }
  return (
    <form action={action} className="mt-8">
      <label className="field"><span>{c('yourName')}</span><input className="input" name="name" defaultValue={defaultName} required maxLength={80} /></label>
      <label className="field"><span>{c('contact')}</span><input className="input" name="contact" defaultValue={defaultContact} required maxLength={160} /></label>
      <label className="field">
        <span>{c('about')}</span>
        <select className="input" name="topic" defaultValue="">
          {TOPICS.map(([v, l]) => (
            <option key={v} value={v}>{l[lang]}</option>
          ))}
        </select>
      </label>
      <label className="field"><span>{c('message')}</span><textarea className="input" name="message" required maxLength={5000} /></label>
      <label className="hidden" aria-hidden="true">{c('leaveEmpty')}<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <label className="mb-4 flex gap-3 text-[.95rem] leading-snug text-[var(--ink-soft)]">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span>{c('agreeMsg')} <Link href="/privacy">{c('privacyNotice')}</Link>.</span>
      </label>
      {state?.error && <p className="error" role="alert">{state.error}</p>}
      <button className="btn" disabled={pending}>{pending ? c('sending') : c('send')}</button>
    </form>
  );
}
