import type { Metadata } from 'next';
import Link from 'next/link';
import { requireUser } from '@/lib/session';
import { getDb } from '@/lib/db';
import { canFacilitate } from '@/lib/auth';
import { getLibrary, getQuestions, getSessions } from '@/lib/content';
import { completedKeys } from '@/lib/learner';
import { deleteAccount, leaveCohortAction, signOut } from '@/app/actions';
import { cohortsForMember } from '@/lib/cohorts';
import { JoinCohortForm } from '@/components/cohort-forms';
import { StagePicker } from '@/components/stage-picker';
import { getLang } from '@/lib/lang';
import { pick, t, type Lang } from '@/lib/i18n';

const COPY = {
  pickUp: { en: 'Pick up where you left off', es: 'Sigue donde te quedaste', pt: 'Continue de onde parou' },
  finished: { en: 'You’ve finished the course', es: 'Terminaste el curso', pt: 'Você terminou o curso' },
  stage2: { en: 'Keep going: Stage 2, practicing', es: 'Sigue: Etapa 2, la práctica', pt: 'Continue: Etapa 2, a prática' },
  of: { en: 'of', es: 'de', pt: 'de' },
  sessions: { en: 'sessions', es: 'sesiones', pt: 'sessões' },
  questionsRead: { en: 'Hard questions read', es: 'Preguntas difíciles leídas', pt: 'Perguntas difíceis lidas' },
  browse: { en: 'Browse questions →', es: 'Ver las preguntas →', pt: 'Ver as perguntas →' },
  whereAreYou: { en: 'Where are you with following Jesus?', es: '¿Dónde estás en cuanto a seguir a Jesús?', pt: 'Onde você está em relação a seguir Jesus?' },
  onlyYou: {
    en: 'Only you can see this. There’s no wrong answer, and you can change it any time. If you pick “Ready to start,” you might want to',
    es: 'Solo tú puedes ver esto. No hay respuesta equivocada, y puedes cambiarla cuando quieras. Si eliges «Listo para empezar», quizá quieras',
    pt: 'Só você pode ver isto. Não há resposta errada, e você pode mudar quando quiser. Se escolher “Pronto para começar”, talvez queira',
  },
  readPlain: { en: 'read what it means in plain words', es: 'leer qué significa en palabras sencillas', pt: 'ler o que significa em palavras simples' },
  or: { en: 'or', es: 'o', pt: 'ou' },
  talk: { en: 'talk to someone', es: 'hablar con alguien', pt: 'falar com alguém' },
  yourGroup: { en: 'Your group', es: 'Tu grupo', pt: 'Seu grupo' },
  with: { en: 'with', es: 'con', pt: 'com' },
  leave: { en: 'Leave', es: 'Salir', pt: 'Sair' },
  enterCode: {
    en: 'Doing the course with a group? Enter the code your facilitator gave you.',
    es: '¿Haces el curso con un grupo? Escribe el código que te dio tu facilitador.',
    pt: 'Está fazendo o curso com um grupo? Digite o código que seu facilitador deu.',
  },
  facSees: {
    en: 'Your facilitator will see which sessions you’ve marked done, so they know how you’re getting on. Never your notes, and never your answer above.',
    es: 'Tu facilitador verá qué sesiones marcaste como hechas, para saber cómo vas. Nunca tus notas, y nunca tu respuesta de arriba.',
    pt: 'Seu facilitador verá quais sessões você marcou como feitas, para saber como você está indo. Nunca suas notas, e nunca sua resposta acima.',
  },
  notesEmpty: {
    en: 'Notes you write on any session, question or article will collect here.',
    es: 'Las notas que escribas en cualquier sesión, pregunta o artículo se juntarán aquí.',
    pt: 'As notas que você escrever em qualquer sessão, pergunta ou artigo vão se juntar aqui.',
  },
  deleteMine: { en: 'Delete my account', es: 'Borrar mi cuenta', pt: 'Excluir minha conta' },
  deleteWarn: {
    en: 'This permanently deletes your account, progress, notes and stage. It can’t be undone.',
    es: 'Esto borra para siempre tu cuenta, tu avance, tus notas y tu etapa. No se puede deshacer.',
    pt: 'Isto exclui para sempre sua conta, seu progresso, suas notas e sua etapa. Não pode ser desfeito.',
  },
  deleteAll: { en: 'Delete everything', es: 'Borrar todo', pt: 'Excluir tudo' },
} satisfies Record<string, Record<Lang, string>>;

export async function generateMetadata(): Promise<Metadata> {
  return { title: t('account', await getLang()), robots: { index: false } };
}


/** Turns an item key back into a title and link, for the notes list. */
function describe(key: string, lang: Lang): { title: string; href: string } {
  const [kind, id] = key.split(':');
  if (kind === 'course') {
    const s = getSessions(lang).find((x) => String(x.n) === id);
    return { title: s ? `${t('session', lang)} ${s.n}: ${s.title}` : key, href: `/course/${id}` };
  }
  if (kind === 'question') {
    const q = getQuestions(lang).find((x) => x.slug === id);
    return { title: q?.title ?? key, href: `/questions/${id}` };
  }
  const [section, slug] = id.split('/');
  const a = getLibrary()[section]?.articles.find((x) => x.slug === slug);
  return { title: a ? pick(a.title, lang) : key, href: `/library/${id}` };
}

export default async function Account() {
  const user = await requireUser('/account');
  const lang = await getLang();
  const c = (k: keyof typeof COPY) => pick(COPY[k], lang);
  const db = await getDb();
  const [done, stageRows, notes, groups] = await Promise.all([
    completedKeys(user.id),
    db.query<{ stage: string }>('SELECT stage FROM journey_stage WHERE user_id = $1', [user.id]),
    db.query<{ item_key: string; body: string; updated_at: Date }>(
      'SELECT item_key, body, updated_at FROM notes WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 50',
      [user.id],
    ),
    cohortsForMember(db, user.id),
  ]);
  const sessions = getSessions(lang);
  const nextSession = sessions.find((s) => !done.has(`course:${s.n}`));
  const courseDone = sessions.filter((s) => done.has(`course:${s.n}`)).length;
  const questionsDone = getQuestions('en').filter((q) => done.has(`question:${q.slug}`)).length;

  return (
    <div className="shell pt-12">
      <p className="kicker kicker-accent">{t('account', lang)}</p>
      <h1 className="mt-3 text-[clamp(2rem,1.5rem+2vw,2.8rem)] font-medium leading-tight">
        {pick({ en: `Good to see you, ${user.name}.`, es: `Qué bueno verte, ${user.name}.`, pt: `Que bom ver você, ${user.name}.` }, lang)}
      </h1>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Link href={nextSession ? `/course/${nextSession.n}` : '/course'} className="card block p-6 text-[var(--ink)] hover:border-[var(--accent)] lg:col-span-2">
          <span className="kicker">{nextSession ? c('pickUp') : c('finished')}</span>
          <span className="mt-2 block text-[1.5rem] leading-snug">
            {nextSession ? `${t('session', lang)} ${nextSession.n}: ${nextSession.title}` : c('stage2')}
          </span>
          {nextSession && <span className="mt-1 block italic text-[var(--ink-soft)]">{nextSession.question}</span>}
          <span className="mt-4 block h-1.5 rounded-full bg-[var(--rule)]">
            <span className="block h-full rounded-full bg-[var(--accent)]" style={{ width: `${(courseDone / sessions.length) * 100}%` }} />
          </span>
          <span className="kicker mt-2 block">{courseDone} {c('of')} {sessions.length} {c('sessions')}</span>
        </Link>
        <div className="card p-6">
          <span className="kicker">{c('questionsRead')}</span>
          <span className="mt-2 block text-[2.4rem] leading-none">{questionsDone}</span>
          <Link href="/questions" className="mt-4 inline-block">{c('browse')}</Link>
        </div>
      </div>

      <section className="mt-14 max-w-3xl" aria-labelledby="stage">
        <h2 id="stage" className="text-[1.4rem] font-medium">{c('whereAreYou')}</h2>
        <p className="mt-1 text-[.98rem] text-[var(--ink-soft)]">
          {c('onlyYou')} <Link href="/course/pathway/offer">{c('readPlain')}</Link> {c('or')} <Link href="/talk">{c('talk')}</Link>.
        </p>
        <StagePicker initial={stageRows[0]?.stage ?? null} lang={lang} />
      </section>

      <section className="mt-14 max-w-3xl" aria-labelledby="groups">
        <h2 id="groups" className="text-[1.4rem] font-medium">{c('yourGroup')}</h2>
        {groups.length > 0 ? (
          <ul className="mt-3 list-none p-0">
            {groups.map((g) => (
              <li key={g.id} className="flex flex-wrap items-baseline justify-between gap-3 border-t border-[var(--rule)] py-3">
                <span>
                  <span className="font-medium">{g.name}</span>
                  {g.facilitator_name && <span className="text-[.95rem] text-[var(--ink-soft)]"> · {c('with')} {g.facilitator_name}</span>}
                </span>
                <form action={leaveCohortAction.bind(null, g.id)}>
                  <button className="kicker cursor-pointer hover:text-[var(--accent)]">{c('leave')}</button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-[.98rem] text-[var(--ink-soft)]">{c('enterCode')}</p>
        )}
        <p className="mt-2 text-[.88rem] italic text-[var(--faint)]">
          {c('facSees')}
        </p>
        <JoinCohortForm lang={lang} />
      </section>

      <section className="mt-14 max-w-3xl" aria-labelledby="notes">
        <h2 id="notes" className="text-[1.4rem] font-medium">{t('yourNotes', lang)}</h2>
        {notes.length === 0 ? (
          <p className="mt-2 text-[var(--ink-soft)]">{c('notesEmpty')}</p>
        ) : (
          <ul className="mt-3 list-none p-0">
            {notes.map((n) => {
              const d = describe(n.item_key, lang);
              return (
                <li key={n.item_key} className="border-t border-[var(--rule)] py-4">
                  <Link href={d.href} className="font-medium">{d.title}</Link>
                  <p className="mt-1 line-clamp-3 whitespace-pre-line text-[.95rem] text-[var(--ink-soft)]">{n.body}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-14 flex flex-wrap items-center gap-4 border-t border-[var(--rule)] pt-6">
        {canFacilitate(user) && <Link href="/facilitate" className="btn btn-ghost">{t('desk', lang)}</Link>}
        <form action={signOut}><button className="btn btn-ghost">{t('signOut', lang)}</button></form>
        <details className="text-[.95rem]">
          <summary className="cursor-pointer text-[var(--faint)]">{c('deleteMine')}</summary>
          <form action={deleteAccount} className="mt-3">
            <p className="mb-3 max-w-md text-[var(--ink-soft)]">{c('deleteWarn')}</p>
            <button className="btn">{c('deleteAll')}</button>
          </form>
        </details>
      </section>
    </div>
  );
}
