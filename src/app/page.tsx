import Link from 'next/link';
import { ArrowRight, Compass, HelpCircle, Library, MessageCircle, Sparkles } from 'lucide-react';
import { getLang } from '@/lib/lang';
import { getLibrary, getQuestions, getSessions, LIBRARY_SECTIONS, withBadges, type LibraryKey } from '@/lib/content';
import { pick, t, type Lang } from '@/lib/i18n';
import { ConfidenceLegend, IconTile, SectionHead } from '@/components/ui';
import { JourneyTrack } from '@/components/lms/journey-track';
import { PhotoFrame } from '@/components/photo';
import { PHOTOS } from '@/lib/photos';
import { courseModules, sessionKey } from '@/lib/course-outline';
import { getCurrentUser } from '@/lib/session';
import { completedKeys } from '@/lib/learner';

const copy = {
  heroTitle: {
    en: 'You probably think you know who Jesus is.',
    es: 'Probablemente crees que ya sabes quién es Jesús.',
    pt: 'Você provavelmente acha que já sabe quem é Jesus.',
  },
  heroBody: {
    en: 'Most of us met a version of him secondhand: from a church, a culture war, a movie, a meme. Encounter is an honest look at the real person and the documents that tell us about him. Real scholarship, in plain words. Your hardest questions welcome. And a clear invitation, with real freedom to say no.',
    es: 'Casi todos conocimos una versión de él de segunda mano: por una iglesia, una guerra cultural, una película, un meme. Encounter es una mirada honesta a la persona real y a los documentos que nos hablan de él. Investigación seria, en palabras sencillas. Tus preguntas más difíciles son bienvenidas. Y una invitación clara, con libertad real para decir que no.',
    pt: 'A maioria de nós conheceu uma versão dele de segunda mão: por uma igreja, uma guerra cultural, um filme, um meme. Encounter é um olhar honesto para a pessoa real e para os documentos que falam dele. Pesquisa séria, em palavras simples. Suas perguntas mais difíceis são bem-vindas. E um convite claro, com liberdade real para dizer não.',
  },
  doorQ: { en: 'I have hard questions', es: 'Tengo preguntas difíciles', pt: 'Tenho perguntas difíceis' },
  doorQ2: { en: 'Straight answers on the things that stop people: suffering, hell, science, the Bible’s contradictions, the church.', es: 'Respuestas directas sobre lo que frena a la gente: el sufrimiento, el infierno, la ciencia, las contradicciones de la Biblia, la iglesia.', pt: 'Respostas diretas sobre o que trava as pessoas: sofrimento, inferno, ciência, contradições da Bíblia, a igreja.' },
  doorC: { en: 'I want to meet Jesus properly', es: 'Quiero conocer a Jesús de verdad', pt: 'Quero conhecer Jesus de verdade' },
  doorC2: { en: 'Thirteen sessions, from where the documents came from to what a life following him looks like. Alone, with a friend, or at a table.', es: 'Trece sesiones, desde de dónde vienen los documentos hasta cómo es una vida siguiéndolo. Solo, con un amigo o en una mesa.', pt: 'Treze sessões, de onde vieram os documentos até como é uma vida seguindo-o. Sozinho, com um amigo ou em grupo.' },
  doorL: { en: 'I want to go deeper', es: 'Quiero profundizar', pt: 'Quero ir mais fundo' },
  doorL2: { en: 'The research library: sermons with their working shown, word studies, and where the texts came from.', es: 'La biblioteca de investigación: sermones con su trabajo a la vista, estudios de palabras y el origen de los textos.', pt: 'A biblioteca de pesquisa: sermões com o trabalho à mostra, estudos de palavras e a origem dos textos.' },
  startHere: { en: 'Start here', es: 'Empieza aquí', pt: 'Comece aqui' },
  honestTitle: { en: 'How we tell you what we know', es: 'Cómo te decimos lo que sabemos', pt: 'Como dizemos o que sabemos' },
  honestBody: {
    en: 'Every claim carries one of five labels, so you always know whether you are reading what nearly every scholar agrees on, or our own read. We never invent a source. Where something is widely repeated but unchecked, we say so.',
    es: 'Cada afirmación lleva una de cinco etiquetas, para que siempre sepas si estás leyendo algo en lo que casi todos los especialistas coinciden, o nuestra propia lectura. Nunca inventamos una fuente. Si algo se repite mucho pero no está verificado, lo decimos.',
    pt: 'Cada afirmação leva um de cinco rótulos, para que você sempre saiba se está lendo algo em que quase todos os estudiosos concordam, ou a nossa leitura. Nunca inventamos uma fonte. Se algo é muito repetido mas não verificado, dizemos.',
  },
  courseTitle: { en: 'The Course', es: 'El curso', pt: 'O curso' },
  courseBody: {
    en: 'Trust the sources, meet the person, weigh the claim, start the life.',
    es: 'Confiar en las fuentes, conocer a la persona, sopesar la afirmación, empezar la vida.',
    pt: 'Confiar nas fontes, conhecer a pessoa, pesar a afirmação, começar a vida.',
  },
  inviteTitle: { en: 'What this is heading toward', es: 'Hacia dónde va todo esto', pt: 'Para onde tudo isso vai' },
  inviteBody: {
    en: 'We won’t hide it: we hope you’ll come to trust Jesus and follow him. That’s the point. But we want you to get there honestly or not at all. No pressure, no fear tactics, no bait-and-switch. You can say no and keep coming.',
    es: 'No lo vamos a esconder: esperamos que llegues a confiar en Jesús y a seguirlo. De eso se trata. Pero queremos que llegues ahí con honestidad, o no llegues. Sin presión, sin miedo, sin trampas. Puedes decir que no y seguir viniendo.',
    pt: 'Não vamos esconder: esperamos que você passe a confiar em Jesus e a segui-lo. Esse é o ponto. Mas queremos que você chegue lá com honestidade, ou não chegue. Sem pressão, sem medo, sem truques. Você pode dizer não e continuar vindo.',
  },
  inviteCta: { en: 'Read it in plain words', es: 'Léelo en palabras sencillas', pt: 'Leia em palavras simples' },
  talkCta: { en: 'Talk to a real person', es: 'Habla con una persona real', pt: 'Fale com uma pessoa real' },
  allQuestions: { en: 'All hard questions', es: 'Todas las preguntas', pt: 'Todas as perguntas' },
  badge: { en: 'An honest path to meeting Jesus', es: 'Un camino honesto para conocer a Jesús', pt: 'Um caminho honesto para conhecer Jesus' },
  statQ: { en: 'hard questions', es: 'preguntas difíciles', pt: 'perguntas difíceis' },
  statS: { en: 'sessions', es: 'sesiones', pt: 'sessões' },
  statL: { en: 'research articles', es: 'artículos de investigación', pt: 'artigos de pesquisa' },
  preview: { en: 'A hard question, answered', es: 'Una pregunta difícil, respondida', pt: 'Uma pergunta difícil, respondida' },
  readFull: { en: 'Read the full answer', es: 'Lee la respuesta completa', pt: 'Leia a resposta completa' },
  evidence: { en: 'Where the evidence stands', es: 'Dónde está la evidencia', pt: 'Onde está a evidência' },
  explore: { en: 'Explore', es: 'Explora', pt: 'Explore' },
  unit: { en: 'Unit', es: 'Unidad', pt: 'Unidade' },
  ways: { en: 'Three ways in', es: 'Tres maneras de entrar', pt: 'Três maneiras de entrar' },
  qTitle: { en: 'The questions people actually ask', es: 'Las preguntas que la gente de verdad hace', pt: 'As perguntas que as pessoas realmente fazem' },
} satisfies Record<string, Record<Lang, string>>;

export default async function Home() {
  const lang = await getLang();
  const c = (k: keyof typeof copy) => pick(copy[k], lang);
  const all = getQuestions(lang);
  const questions = all.slice(0, 6);
  const sessions = getSessions(lang);
  const lib = getLibrary();
  const articles = (Object.keys(LIBRARY_SECTIONS) as LibraryKey[]).reduce((n, k) => n + lib[k].articles.length, 0);
  // The hero shows a real Hard Question with its labelled claims: the method, not a promise of it.
  const featured = all.find((q) => q.standing.length >= 2) ?? all[0];
  const user = await getCurrentUser();
  const done = user ? await completedKeys(user.id) : new Set<string>();
  const nextSession = sessions.find((s) => !done.has(sessionKey(s.n))) ?? sessions[0];
  const [lead, ...rest] = questions.filter((q) => q.slug !== featured?.slug).slice(0, 6);

  return (
    <>
      <section className="shell grid items-center gap-12 pb-16 pt-14 sm:pt-20 lg:grid-cols-[1.1fr_.9fr] lg:gap-14">
        <div className="rise">
          <span className="pill pill-accent"><Sparkles size={13} /> {c('badge')}</span>
          <h1 className="mt-6 max-w-[16ch] text-[clamp(2.6rem,1.5rem+4.2vw,4.6rem)] font-medium leading-[1.02] tracking-[-.028em] text-balance">
            {c('heroTitle')}
          </h1>
          <p className="dek mt-6 !text-[1.16rem]">{c('heroBody')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/questions" className="btn">{c('doorQ')} <ArrowRight size={16} /></Link>
            <Link href="/course" className="btn btn-ghost">{c('startHere')}</Link>
          </div>
          <ul className="sans m-0 mt-10 flex list-none flex-wrap gap-x-8 gap-y-3 p-0">
            {(
              [
                [all.length, c('statQ')],
                [sessions.length, c('statS')],
                [articles, c('statL')],
              ] as const
            ).map(([n, l]) => (
              <li key={l} className="flex items-baseline gap-2">
                <span className="text-[1.6rem] font-semibold tracking-[-.02em] text-[var(--ink)]">{n}</span>
                <span className="text-[.86rem] text-[var(--faint)]">{l}</span>
              </li>
            ))}
          </ul>
        </div>

        {featured && (
          <div className="rise rise-2 relative">
            <div aria-hidden="true" className="absolute inset-0 -z-10 rounded-[40px] lg:-inset-6 bg-[radial-gradient(closest-side,var(--accent-glow),transparent)] opacity-70 blur-2xl" />
            <Link href={`/questions/${featured.slug}`} className="glass-strong lift group block rounded-[28px] p-6 text-[var(--ink)] sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <span className="kicker kicker-accent">{c('preview')}</span>
                <IconTile className="!h-9 !w-9 !rounded-xl"><HelpCircle size={17} /></IconTile>
              </div>
              <p className="mt-5 text-[1.6rem] font-medium leading-tight tracking-[-.01em]">{featured.title}</p>
              <p className="mt-3 line-clamp-4 text-[1rem] leading-relaxed text-[var(--ink-soft)]">{featured.short}</p>
              <div className="well mt-6 p-4">
                <p className="kicker mb-3">{c('evidence')}</p>
                <ul className="m-0 list-none space-y-2.5 p-0">
                  {featured.standing.slice(0, 3).map((s, i) => (
                    <li key={i} className="text-[.92rem] leading-snug text-[var(--ink-soft)]">
                      <span dangerouslySetInnerHTML={{ __html: withBadges(`[${s.label}]`, lang) }} /> {s.claim}
                    </li>
                  ))}
                </ul>
              </div>
              <span className="sans mt-6 inline-flex items-center gap-1.5 text-[.9rem] font-medium text-[var(--accent)]">
                {c('readFull')} <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        )}
      </section>

      <section className="shell" aria-label={c('ways')}>
        <div className="glass grid overflow-hidden !rounded-[28px] md:grid-cols-3 md:divide-x md:divide-[var(--rule)] max-md:divide-y max-md:divide-[var(--rule)]">
          {(
            [
              ['/questions', 'doorQ', 'doorQ2', <HelpCircle key="q" size={20} />],
              ['/course', 'doorC', 'doorC2', <Compass key="c" size={20} />],
              ['/library', 'doorL', 'doorL2', <Library key="l" size={20} />],
            ] as const
          ).map(([href, h, b, icon], i) => (
            <Link key={href} href={href} className={`rise rise-${i + 1} group relative flex flex-col p-6 text-[var(--ink)] transition-colors hover:bg-[var(--glass-inner-hover)] sm:p-8`}>
              <span className="flex items-center justify-between">
                <IconTile>{icon}</IconTile>
                <span className="mono text-[.72rem] text-[var(--faint)]">0{i + 1}</span>
              </span>
              <span className="mt-5 block text-[1.32rem] font-medium leading-tight group-hover:text-[var(--accent)]">{c(h)}</span>
              <span className="mt-2 block flex-1 text-[.96rem] leading-normal text-[var(--ink-soft)]">{c(b)}</span>
              <span className="sans mt-5 inline-flex items-center gap-1.5 text-[.86rem] font-medium text-[var(--accent)]">
                {c('explore')} <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="shell mt-24" aria-labelledby="home-q">
        <SectionHead id="home-q" kicker={t('navQuestions', lang)} title={c('qTitle')} href="/questions" linkLabel={c('allQuestions')} />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          {lead && (
            <Link href={`/questions/${lead.slug}`} className="group relative block min-h-[340px] overflow-hidden rounded-[28px] text-white">
              <PhotoFrame photo={PHOTOS.questions} className="!absolute inset-0 !rounded-[28px]" sizes="(min-width: 1024px) 560px, 100vw" />
              <span className="relative z-[2] flex h-full min-h-[340px] flex-col justify-end p-7 sm:p-9">
                <span className="mono text-[.74rem] text-white/80">{String(lead.order).padStart(2, '0')}</span>
                <span className="mt-2 block max-w-[20ch] text-[clamp(1.6rem,1.2rem+1.2vw,2.1rem)] font-medium leading-[1.12] tracking-[-.012em] [text-shadow:0_2px_18px_rgb(0_0_0/.35)]">{lead.title}</span>
                <span className="glass-strong mt-5 block max-w-[46ch] !rounded-2xl p-4 text-[.95rem] leading-relaxed text-[var(--ink)]">
                  <span className="line-clamp-3">{lead.short}</span>
                  <span className="sans mt-2 inline-flex items-center gap-1.5 text-[.84rem] font-medium text-[var(--accent)]">{c('readFull')} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
                </span>
              </span>
            </Link>
          )}
          <ul className="glass m-0 list-none divide-y divide-[var(--rule)] overflow-hidden !rounded-[28px] p-0">
            {rest.map((q) => (
              <li key={q.slug}>
                <Link href={`/questions/${q.slug}`} className="group grid grid-cols-[2.2rem_minmax(0,1fr)_auto] items-start gap-3 px-6 py-5 text-[var(--ink)] transition-colors hover:bg-[var(--glass-inner-hover)]">
                  <span className="mono pt-1 text-[.72rem] text-[var(--accent)]">{String(q.order).padStart(2, '0')}</span>
                  <span className="min-w-0">
                    <span className="block text-[1.1rem] font-medium leading-snug group-hover:text-[var(--accent)]">{q.title}</span>
                    <span className="mt-1 line-clamp-1 text-[.9rem] text-[var(--ink-soft)]">{q.short}</span>
                  </span>
                  <ArrowRight size={16} className="mt-1 text-[var(--faint)] transition-all group-hover:translate-x-1 group-hover:text-[var(--accent)]" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="shell mt-24" aria-labelledby="home-course">
        <div className="glass grid gap-10 !rounded-[28px] p-7 sm:p-10 lg:grid-cols-[.75fr_1.25fr]">
          <div>
            <p className="kicker kicker-accent">{c('courseTitle')}</p>
            <h2 id="home-course" className="mt-3 text-[clamp(1.6rem,1.2rem+1.4vw,2.2rem)] font-medium leading-tight tracking-[-.012em]">{c('courseBody')}</h2>
            <p className="mt-4 text-[1rem] text-[var(--ink-soft)]">{c('doorC2')}</p>
            <Link href="/course" className="btn mt-7">{c('startHere')} <ArrowRight size={16} /></Link>
          </div>
          <div className="min-w-0 self-center">
            <JourneyTrack modules={courseModules(lang, done, sessions)} nextId={user ? sessionKey(nextSession.n) : undefined} label={c('courseTitle')} />
            <Link href={`/course/${nextSession.n}`} className="well lift group mt-7 flex items-center gap-4 p-4 text-[var(--ink)] hover:!bg-[var(--glass-hover)]">
              <span className="lesson-numeral !text-[2.4rem]">{String(nextSession.n).padStart(2, '0')}</span>
              <span className="min-w-0 flex-1">
                <span className="kicker">{user && done.size ? pick({ en: 'Up next for you', es: 'Lo que sigue para ti', pt: 'O próximo para você' }, lang) : pick({ en: 'Session one', es: 'Sesión uno', pt: 'Sessão um' }, lang)}</span>
                <span className="mt-1 block text-[1.08rem] font-medium leading-snug">{nextSession.title}</span>
              </span>
              <ArrowRight size={18} className="text-[var(--accent)] transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <section className="shell mt-6" aria-labelledby="home-honest">
        <div className="glass grid gap-10 p-7 sm:p-10 md:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="kicker kicker-accent">{c('honestTitle')}</p>
            <h2 id="home-honest" className="mt-3 text-[clamp(1.6rem,1.2rem+1.4vw,2.2rem)] font-medium leading-tight tracking-[-.012em]">
              {pick({ en: 'Five labels. Every claim.', es: 'Cinco etiquetas. Cada afirmación.', pt: 'Cinco rótulos. Cada afirmação.' }, lang)}
            </h2>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-[var(--ink-soft)]">{c('honestBody')}</p>
            <Link href="/about/method" className="sans mt-6 inline-flex items-center gap-1.5 text-[.9rem] font-medium">
              {pick({ en: 'How the work is done', es: 'Cómo se hace el trabajo', pt: 'Como o trabalho é feito' }, lang)} <ArrowRight size={15} />
            </Link>
          </div>
          <ConfidenceLegend lang={lang} />
        </div>
      </section>

      <section className="shell mt-24" aria-labelledby="home-invite">
        <PhotoFrame photo={PHOTOS.invite} className="!rounded-[32px] px-4 py-16 sm:px-10 sm:py-24" sizes="(min-width: 1280px) 1200px, 100vw">
          <div className="glass-strong relative z-[2] mx-auto max-w-[760px] !rounded-[28px] px-7 py-12 text-center sm:px-12 sm:py-14">
            <p className="kicker kicker-accent relative">{c('inviteTitle')}</p>
            <p id="home-invite" className="relative mx-auto mt-5 max-w-[46ch] text-[clamp(1.25rem,1rem+.9vw,1.6rem)] leading-relaxed text-balance">{c('inviteBody')}</p>
            <div className="relative mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/course/pathway/offer" className="btn">{c('inviteCta')}</Link>
              <Link href="/talk" className="btn btn-ghost"><MessageCircle size={16} /> {c('talkCta')}</Link>
            </div>
          </div>
        </PhotoFrame>
      </section>
    </>
  );
}
