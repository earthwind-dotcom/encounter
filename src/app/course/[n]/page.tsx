import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLang } from '@/lib/lang';
import { getSession, getSessions, renderMarkdown, UNITS } from '@/lib/content';
import { getCurrentUser, requireMember } from '@/lib/session';
import { canFacilitate } from '@/lib/auth';
import { completedKeys, learnerState } from '@/lib/learner';
import { courseModules, sessionKey } from '@/lib/course-outline';
import { pick, t } from '@/lib/i18n';
import { LearnerTools } from '@/components/learner-tools';
import { promoteLeadLabels, withToc } from '@/lib/toc';
import { BookOpen, ChevronDown, Clock, DoorOpen, HelpCircle, MessageCircle, PencilLine, Sprout, Users } from 'lucide-react';
import { ReadingProgress } from '@/components/reading';
import { CourseOutline } from '@/components/lms/course-outline';
import { LessonSteps } from '@/components/lms/lesson-steps';
import { LessonMedia } from '@/components/lms/lesson-media';
import { LessonComplete } from '@/components/lms/lesson-complete';
import { PrintButton } from '@/components/lms/print-button';
import { PracticeCheckin } from '@/components/lms/practice';
import { PassageReader } from '@/components/lms/passage-reader';
import { getPassage, parseRefs } from '@/lib/bible';
import { practiceDays } from '@/lib/practice';
import { Marked } from 'marked';

// Session passages are our own frontmatter; italics mark book titles (*Annals*).
const inline = new Marked();
const SESSION = { en: 'Session', es: 'Sesión', pt: 'Sessão' };
const UNIT = { en: 'Unit', es: 'Unidad', pt: 'Unidade' };

const L = {
  outline: { en: 'The course', es: 'El curso', pt: 'O curso' },
  done: { en: 'done', es: 'hechas', pt: 'feitas' },
  of: { en: 'of', es: 'de', pt: 'de' },
  min: { en: 'min', es: 'min', pt: 'min' },
  minRead: { en: 'min read', es: 'min de lectura', pt: 'min de leitura' },
  show: { en: 'Show', es: 'Ver', pt: 'Ver' },
  hide: { en: 'Hide', es: 'Ocultar', pt: 'Ocultar' },
  steps: { en: 'In this session', es: 'En esta sesión', pt: 'Nesta sessão' },
  practice: { en: 'This week’s practice', es: 'La práctica de esta semana', pt: 'A prática desta semana' },
  nextStep: { en: 'One next step', es: 'Un siguiente paso', pt: 'Um próximo passo' },
  did: { en: 'I did it today', es: 'Lo hice hoy', pt: 'Fiz hoje' },
  didToday: { en: 'Done today', es: 'Hecho hoy', pt: 'Feito hoje' },
  streakDays: { en: 'days running', es: 'días seguidos', pt: 'dias seguidos' },
  thisWeek: { en: 'Last seven days', es: 'Últimos siete días', pt: 'Últimos sete dias' },
  print: { en: 'Print handout', es: 'Imprimir', pt: 'Imprimir' },
  complete: { en: 'Mark complete', es: 'Marcar como hecha', pt: 'Marcar como feita' },
  completeContinue: { en: 'Complete and continue', es: 'Terminar y seguir', pt: 'Concluir e seguir' },
  completed: { en: 'Completed', es: 'Hecha', pt: 'Feita' },
  undo: { en: 'Completed', es: 'Hecha', pt: 'Feita' },
  signIn: { en: 'Sign in to track', es: 'Entra para guardar tu avance', pt: 'Entre para salvar seu progresso' },
  endOf: { en: 'End of session', es: 'Fin de la sesión', pt: 'Fim da sessão' },
  finished: { en: 'You’ve finished the course.', es: 'Terminaste el curso.', pt: 'Você terminou o curso.' },
  finishedHint: { en: 'The last session. Mark it complete to finish the course.', es: 'La última sesión. Márcala para terminar el curso.', pt: 'A última sessão. Marque para terminar o curso.' },
  next: { en: 'Next', es: 'Siguiente', pt: 'Próxima' },
  prev: { en: 'Previous', es: 'Anterior', pt: 'Anterior' },
  speed: { en: 'Playback speed', es: 'Velocidad', pt: 'Velocidade' },
  resumed: { en: 'Picked up where you stopped', es: 'Sigues donde te quedaste', pt: 'Continuando de onde parou' },
  captions: { en: 'Captions', es: 'Subtítulos', pt: 'Legendas' },
  listen: { en: 'Listen to this session', es: 'Escucha esta sesión', pt: 'Ouça esta sessão' },
};

export function generateStaticParams() {
  return getSessions().map((s) => ({ n: String(s.n) }));
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const lang = await getLang();
  const s = getSession(Number((await params).n), lang);
  return s ? { title: `${pick(SESSION, lang)} ${s.n}: ${s.title}`, description: s.question } : {};
}

export default async function SessionPage({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n);
  await requireMember(`/course/${n}`);
  const lang = await getLang();
  const s = getSession(n, lang);
  if (!s) notFound();
  const all = getSessions(lang);
  // The language the text is actually in: the reader's, or English when there's no translation yet.
  const textLang = s.translated ? lang : 'en';
  const prev = all.find((x) => x.n === n - 1);
  const next = all.find((x) => x.n === n + 1);
  const user = await getCurrentUser();
  const facilitator = canFacilitate(user);
  const key = sessionKey(n);
  const [tools, done, pdays] = await Promise.all([
    learnerState(key, lang),
    user ? completedKeys(user.id) : Promise.resolve(new Set<string>()),
    user ? practiceDays(user.id) : Promise.resolve([] as string[]),
  ]);
  const modules = courseModules(lang, done, all);

  // The question leads the page in its own card, so drop the guide's opening copy of it.
  const body = promoteLeadLabels(renderMarkdown(s.participant, textLang)).replace(/^\s*<h2>([^<]*)<\/h2>\s*<p>[\s\S]*?<\/p>/, (whole, h: string) =>
    /^(the question|la pregunta|a pergunta)$/i.test(h.trim()) ? '' : whole,
  );
  const { html, toc } = withToc(body);
  // The primary text, read in place. Refs come from the English frontmatter (book names).
  const passages = parseRefs(getSession(n, 'en')?.passage ?? s.passage).map((r) => ({ label: r.label, verses: getPassage(r) })).filter((p) => p.verses.length);
  const label = (x: typeof s) => `${pick(SESSION, lang)} ${x.n}`;

  return (
    <article className="shell pb-28 pt-8 lg:pb-10" lang={textLang}>
      <ReadingProgress />
      <div className="grid gap-8 lg:grid-cols-[290px_minmax(0,1fr)] lg:gap-10">
        <aside className="no-print lg:sticky lg:top-24 lg:self-start">
          <CourseOutline
            key={key}
            modules={modules}
            currentId={key}
            labels={{ outline: pick(L.outline, lang), done: pick(L.done, lang), of: pick(L.of, lang), minutes: pick(L.min, lang), show: pick(L.show, lang), hide: pick(L.hide, lang) }}
          />
        </aside>

        <div className="min-w-0 space-y-6">
          <div className="rise pt-2">
            <p className="kicker flex flex-wrap items-center gap-2">
              <Link href="/course" className="kicker kicker-accent hover:text-[var(--ink)]">{t('navCourse', lang)}</Link>
              <span aria-hidden="true" className="text-[var(--rule-strong)]">/</span>
              <span>{pick(UNIT, lang)} {s.unit} · {pick(UNITS[s.unit], lang)}</span>
            </p>
            <div className="mt-5 flex items-start gap-5">
              <span aria-hidden="true" className="lesson-numeral hidden sm:block">{String(n).padStart(2, '0')}</span>
              <div className="min-w-0">
                <h1 className="page-title max-w-[24ch]">{s.title}</h1>
                <p className="sans mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[.84rem] text-[var(--ink-soft)]">
                  <span className="inline-flex items-center gap-1.5"><Clock size={14} /> {s.minutes} {pick(L.minRead, lang)}</span>
                  <span className="inline-flex items-center gap-1.5"><BookOpen size={14} /> <span dangerouslySetInnerHTML={{ __html: inline.parseInline(s.passage.replace(/\.$/, '')) as string }} /></span>
                  {done.has(key) && <span className="pill pill-ok">{pick(L.completed, lang)}</span>}
                  {s.status !== 'published' && s.status !== 'reviewed' && <span className="pill">{s.status === 'outline' ? pick({ en: 'Outline', es: 'Esquema', pt: 'Esboço' }, lang) : pick({ en: 'Draft', es: 'Borrador', pt: 'Rascunho' }, lang)}</span>}
                </p>
              </div>
            </div>
            {!s.translated && <p className="article mt-4"><span className="xlate block">{t('notTranslated', lang)}</span></p>}
          </div>

          <div className="glass-strong rise rise-1 relative overflow-hidden !rounded-[24px] p-6 sm:p-8">
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,var(--dawn-2),transparent)] blur-xl" />
            <p className="kicker kicker-accent relative flex items-center gap-2"><HelpCircle size={14} /> {pick({ en: 'The question', es: 'La pregunta', pt: 'A pergunta' }, lang)}</p>
            <p className="relative mt-3 max-w-[30ch] text-[clamp(1.4rem,1.1rem+1.2vw,2rem)] italic leading-[1.2] tracking-[-.01em]">{s.question}</p>
          </div>

          {s.media && (
            <LessonMedia
              kind={s.media.kind}
              src={s.media.src}
              poster={s.media.poster}
              captions={s.media.captions}
              captionsLang={textLang}
              title={`${label(s)}: ${s.title}`}
              labels={{ speed: pick(L.speed, lang), resumed: pick(L.resumed, lang), captions: pick(L.captions, lang), listen: pick(L.listen, lang) }}
            />
          )}

          <PassageReader
            passages={passages}
            labels={{
              title: pick({ en: 'Read the text', es: 'Lee el texto', pt: 'Leia o texto' }, lang),
              translation: 'World English Bible',
              readAll: pick({ en: 'Read all', es: 'Leer todo', pt: 'Ler tudo' }, lang),
              fold: pick({ en: 'Fold', es: 'Plegar', pt: 'Recolher' }, lang),
              note: lang === 'en' ? undefined : pick({ en: '', es: 'Texto en inglés (World English Bible, dominio público). La guía cita el pasaje en español.', pt: 'Texto em inglês (World English Bible, domínio público). O guia cita a passagem em português.' }, lang),
            }}
          />

          <LessonSteps steps={toc} label={pick(L.steps, lang)} />

          {s.status !== 'published' && s.status !== 'reviewed' && (
            <p className="sans flex items-start gap-3 rounded-2xl border border-dashed border-[var(--rule-strong)] bg-[var(--glass-inner-2)] p-4 text-[.84rem] leading-relaxed text-[var(--ink-soft)]">
              <PencilLine size={16} className="mt-0.5 shrink-0 text-[var(--gold)]" />
              <span>
                {s.status === 'outline'
                  ? pick({ en: 'This session is an outline. The full guide is still being researched and written, so what follows is the plan: the question, the text, and what the session will cover.', es: 'Esta sesión es un esquema. La guía completa todavía se está investigando y escribiendo; lo que sigue es el plan: la pregunta, el texto y lo que cubrirá la sesión.', pt: 'Esta sessão é um esboço. O guia completo ainda está sendo pesquisado e escrito; o que segue é o plano: a pergunta, o texto e o que a sessão vai cobrir.' }, lang)
                  : pick({ en: 'This session guide is written and awaiting review. Its sources are being checked before it is used with a group.', es: 'Esta guía está escrita y en espera de revisión. Sus fuentes se están verificando antes de usarla con un grupo.', pt: 'Este guia está escrito e aguardando revisão. Suas fontes estão sendo verificadas antes de ser usado com um grupo.' }, lang)}
              </span>
            </p>
          )}

          <div className="glass rise rise-2 rounded-[24px] p-6 sm:p-10">
            <div className="prose lesson-prose" dangerouslySetInnerHTML={{ __html: html }} />
          </div>

          {(s.practice || s.nextStep) && (
            <section id="practice" className="grid scroll-mt-36 gap-4 sm:grid-cols-2" aria-label={pick(L.practice, lang)}>
              {s.practice && (
                <div className="glass-strong practice-card relative overflow-hidden !rounded-[22px] p-6">
                  <p className="kicker kicker-accent flex items-center gap-2"><Sprout size={14} /> {pick(L.practice, lang)}</p>
                  <p className="mt-3 text-[1.08rem] leading-relaxed">{s.practice}</p>
                  {user && (
                    <PracticeCheckin
                      itemKey={key}
                      days={pdays}
                      labels={{ did: pick(L.did, lang), didToday: pick(L.didToday, lang), streak: pick(L.streakDays, lang), week: pick(L.thisWeek, lang) }}
                    />
                  )}
                </div>
              )}
              {s.nextStep && (
                <div className="glass !rounded-[22px] p-6">
                  <p className="kicker flex items-center gap-2"><DoorOpen size={14} /> {pick(L.nextStep, lang)}</p>
                  <p className="mt-3 text-[1.02rem] leading-relaxed text-[var(--ink-soft)]">{s.nextStep}</p>
                </div>
              )}
            </section>
          )}

          {s.invitation && (
            <section className="glass-strong relative overflow-hidden rounded-[24px] p-6 sm:p-9" aria-labelledby="invite">
              <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,var(--accent-glow),transparent)] blur-xl" />
              <h2 id="invite" className="kicker kicker-accent relative flex items-center gap-2"><DoorOpen size={14} /> {pick({ en: 'The invitation', es: 'La invitación', pt: 'O convite' }, lang)}</h2>
              <p className="relative mt-3 max-w-[60ch] text-[1.12rem] leading-relaxed">
                {pick(
                  {
                    en: 'This session makes the invitation plainly. If this is true, it isn’t neutral information: the claim is that Jesus is alive and asking you to trust him and follow him. You can respond today, in your own words. You can also say “not yet” and keep coming. Both are honest answers.',
                    es: 'Esta sesión hace la invitación con claridad. Si esto es verdad, no es información neutral: la afirmación es que Jesús está vivo y te pide que confíes en él y lo sigas. Puedes responder hoy, con tus propias palabras. También puedes decir «todavía no» y seguir viniendo. Las dos son respuestas honestas.',
                    pt: 'Esta sessão faz o convite com clareza. Se isso é verdade, não é informação neutra: a afirmação é que Jesus está vivo e pede que você confie nele e o siga. Você pode responder hoje, com suas palavras. Também pode dizer “ainda não” e continuar vindo. As duas são respostas honestas.',
                  },
                  lang,
                )}
              </p>
              <div className="relative mt-6 flex flex-wrap gap-3">
                <Link href="/course/pathway/offer" className="btn">{pick({ en: 'What it means, in plain words', es: 'Qué significa, en palabras sencillas', pt: 'O que significa, em palavras simples' }, lang)}</Link>
                <Link href="/talk" className="btn btn-ghost"><MessageCircle size={16} /> {t('navTalk', lang)}</Link>
              </div>
            </section>
          )}

          <LearnerTools {...tools} returnTo={`/course/${n}`} progress={false} />

          {facilitator && s.facilitator && (
            <details className="glass group p-5 sm:p-7">
              <summary className="sans flex cursor-pointer list-none items-center gap-3 font-medium text-[var(--accent)]">
                <Users size={17} /> {pick({ en: 'Facilitator guide', es: 'Guía para facilitadores', pt: 'Guia do facilitador' }, lang)}
                <ChevronDown size={16} className="ml-auto transition-transform group-open:rotate-180" />
              </summary>
              <div className="prose mt-6" dangerouslySetInnerHTML={{ __html: promoteLeadLabels(renderMarkdown(s.facilitator, textLang)) }} />
            </details>
          )}

          <LessonComplete
            itemKey={key}
            signedIn={!!user}
            initialDone={done.has(key)}
            prev={prev && { href: `/course/${prev.n}`, title: prev.title, label: label(prev) }}
            next={next && { href: `/course/${next.n}`, title: next.title, label: label(next) }}
            lessonLabel={label(s)}
            finishHref="/account"
            returnTo={`/course/${n}`}
            labels={{
              complete: pick(L.complete, lang),
              completeContinue: pick(L.completeContinue, lang),
              completed: pick(L.completed, lang),
              undo: pick(L.undo, lang),
              signInToTrack: pick(L.signIn, lang),
              endOf: pick(L.endOf, lang),
              finished: pick(L.finished, lang),
              finishedHint: pick(L.finishedHint, lang),
              next: pick(L.next, lang),
              prev: pick(L.prev, lang),
            }}
          />

          <p className="no-print text-center">
            <PrintButton label={pick(L.print, lang)} />
          </p>
        </div>
      </div>
    </article>
  );
}
