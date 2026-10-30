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
import { ArrowRight, Compass, HelpCircle, LayoutDashboard, Lock, LogOut, NotebookPen, Play, ShieldCheck, Trash2, Users } from 'lucide-react';
import { PageHeader, ProgressRing, Stat } from '@/components/ui';

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

  const card = 'glass p-6 sm:p-7';
  return (
    <div className="shell">
      <PageHeader
        kicker={t('account', lang)}
        title={pick({ en: `Good to see you, ${user.name}.`, es: `Qué bueno verte, ${user.name}.`, pt: `Que bom ver você, ${user.name}.` }, lang)}
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-4">
        <Link href={nextSession ? `/course/${nextSession.n}` : '/course'} className="glass-strong lift rise rise-1 group flex flex-wrap items-center gap-6 rounded-[24px] p-6 text-[var(--ink)] sm:flex-nowrap lg:col-span-2">
          <ProgressRing value={courseDone} total={sessions.length} size={104} label={`${courseDone} ${c('of')} ${sessions.length} ${c('sessions')}`} />
          <span className="min-w-0">
            <span className="kicker kicker-accent">{nextSession ? c('pickUp') : c('finished')}</span>
            <span className="mt-2 block text-[1.4rem] font-medium leading-snug">
              {nextSession ? `${t('session', lang)} ${nextSession.n}: ${nextSession.title}` : c('stage2')}
            </span>
            {nextSession && <span className="mt-1 block text-[.95rem] italic text-[var(--ink-soft)]">{nextSession.question}</span>}
            <span className="sans mt-4 inline-flex items-center gap-1.5 text-[.88rem] font-medium text-[var(--accent)]">
              <Play size={14} /> {pick({ en: 'Open session', es: 'Abrir sesión', pt: 'Abrir sessão' }, lang)}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </span>
          </span>
        </Link>
        <div className="rise rise-2 [&>div]:h-full"><Stat label={c('questionsRead')} value={questionsDone} hint={<Link href="/questions">{c('browse')}</Link>} icon={<HelpCircle size={19} />} /></div>
        <div className="rise rise-3 [&>div]:h-full"><Stat label={t('yourNotes', lang)} value={notes.length} hint={pick({ en: 'Private to you', es: 'Solo para ti', pt: 'Só para você' }, lang)} icon={<NotebookPen size={19} />} /></div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <section className={card} aria-labelledby="stage">
          <h2 id="stage" className="flex items-center gap-2.5 text-[1.35rem] font-medium"><Compass size={19} className="text-[var(--accent)]" /> {c('whereAreYou')}</h2>
          <p className="sans mt-2 text-[.88rem] leading-relaxed text-[var(--ink-soft)]">
            <Lock size={12} className="mr-1 inline -translate-y-px" /> {c('onlyYou')} <Link href="/course/pathway/offer">{c('readPlain')}</Link> {c('or')} <Link href="/talk">{c('talk')}</Link>.
          </p>
          <StagePicker initial={stageRows[0]?.stage ?? null} lang={lang} />
        </section>

        <section className={card} aria-labelledby="groups">
          <h2 id="groups" className="flex items-center gap-2.5 text-[1.35rem] font-medium"><Users size={19} className="text-[var(--accent)]" /> {c('yourGroup')}</h2>
          {groups.length > 0 ? (
            <ul className="mt-4 list-none space-y-2 p-0">
              {groups.map((g) => (
                <li key={g.id} className="well flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <span>
                    <span className="font-medium">{g.name}</span>
                    {g.facilitator_name && <span className="sans block text-[.84rem] text-[var(--ink-soft)]">{c('with')} {g.facilitator_name}</span>}
                  </span>
                  <form action={leaveCohortAction.bind(null, g.id)}>
                    <button className="btn btn-ghost btn-sm">{c('leave')}</button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[.98rem] text-[var(--ink-soft)]">{c('enterCode')}</p>
          )}
          <JoinCohortForm lang={lang} />
          <p className="sans mt-4 flex gap-2 text-[.8rem] leading-relaxed text-[var(--faint)]"><ShieldCheck size={14} className="mt-0.5 shrink-0" /> {c('facSees')}</p>
        </section>
      </div>

      <section className={`${card} mt-6`} aria-labelledby="notes">
        <h2 id="notes" className="flex items-center gap-2.5 text-[1.35rem] font-medium"><NotebookPen size={19} className="text-[var(--accent)]" /> {t('yourNotes', lang)}</h2>
        {notes.length === 0 ? (
          <p className="mt-2 text-[var(--ink-soft)]">{c('notesEmpty')}</p>
        ) : (
          <ul className="mt-4 grid list-none gap-3 p-0 md:grid-cols-2">
            {notes.map((n) => {
              const d = describe(n.item_key, lang);
              return (
                <li key={n.item_key}>
                  <Link href={d.href} className="well lift block h-full p-4 text-[var(--ink)] hover:!bg-[var(--glass-hover)]">
                    <span className="block font-medium leading-snug">{d.title}</span>
                    <span className="mt-1.5 line-clamp-3 block whitespace-pre-line text-[.93rem] text-[var(--ink-soft)]">{n.body}</span>
                    <span className="sans mt-3 block text-[.74rem] text-[var(--faint)]">
                      {new Date(n.updated_at).toLocaleDateString({ en: 'en-US', es: 'es-MX', pt: 'pt-BR' }[lang], { dateStyle: 'medium' })}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-6 flex flex-wrap items-center gap-3">
        {canFacilitate(user) && <Link href="/facilitate" className="btn btn-ghost"><LayoutDashboard size={15} /> {t('desk', lang)}</Link>}
        <form action={signOut}><button className="btn btn-ghost"><LogOut size={15} /> {t('signOut', lang)}</button></form>
        <details className="sans ml-auto text-[.88rem]">
          <summary className="cursor-pointer list-none rounded-full px-3 py-2 text-[var(--faint)] hover:text-[var(--danger)]">{c('deleteMine')}</summary>
          <form action={deleteAccount} className="glass mt-3 max-w-sm p-5">
            <p className="mb-4 text-[var(--ink-soft)]">{c('deleteWarn')}</p>
            <button className="btn !bg-none !bg-[var(--danger)] !text-white"><Trash2 size={15} /> {c('deleteAll')}</button>
          </form>
        </details>
      </section>
    </div>
  );
}
