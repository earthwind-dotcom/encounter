import Link from 'next/link';
import { getLang } from '@/lib/lang';
import { getQuestions, getSessions, UNITS } from '@/lib/content';
import { CONFIDENCE, pick, type Lang } from '@/lib/i18n';

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
} satisfies Record<string, Record<Lang, string>>;

export default async function Home() {
  const lang = await getLang();
  const c = (k: keyof typeof copy) => pick(copy[k], lang);
  const questions = getQuestions(lang).slice(0, 6);
  const sessions = getSessions();

  return (
    <>
      <section className="shell pt-16 pb-14 sm:pt-24">
        <p className="kicker kicker-accent">Encounter</p>
        <h1 className="mt-4 max-w-[18ch] text-[clamp(2.4rem,1.5rem+3.6vw,4.2rem)] font-medium leading-[1.04] tracking-[-.02em] text-balance">
          {c('heroTitle')}
        </h1>
        <p className="mt-6 max-w-[60ch] text-[1.15rem] leading-relaxed text-[var(--ink-soft)]">{c('heroBody')}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/questions" className="btn">{c('doorQ')} →</Link>
          <Link href="/course" className="btn btn-ghost">{c('startHere')}</Link>
        </div>
      </section>

      <section className="shell grid gap-4 md:grid-cols-3" aria-label="Ways in">
        {(
          [
            ['/questions', 'doorQ', 'doorQ2', '01'],
            ['/course', 'doorC', 'doorC2', '02'],
            ['/library', 'doorL', 'doorL2', '03'],
          ] as const
        ).map(([href, h, b, n]) => (
          <Link key={href} href={href} className="card group block p-6 text-[var(--ink)] transition-colors hover:border-[var(--accent)]">
            <span className="kicker kicker-accent">{n}</span>
            <span className="mt-3 block text-[1.35rem] font-medium leading-tight group-hover:text-[var(--accent)]">{c(h)}</span>
            <span className="mt-2 block text-[.98rem] leading-normal text-[var(--ink-soft)]">{c(b)}</span>
          </Link>
        ))}
      </section>

      <section className="shell mt-20">
        <div className="flex items-baseline justify-between gap-4 border-b border-[var(--rule)] pb-3">
          <h2 className="kicker">{c('doorQ')}</h2>
          <Link href="/questions" className="kicker kicker-accent">{c('allQuestions')} →</Link>
        </div>
        <ul className="grid gap-x-12 md:grid-cols-2">
          {questions.map((q) => (
            <li key={q.slug} className="border-b border-[var(--rule)]">
              <Link href={`/questions/${q.slug}`} className="group block py-5 text-[var(--ink)]">
                <span className="block text-[1.2rem] leading-snug group-hover:text-[var(--accent)]">{q.title}</span>
                <span className="mt-1 line-clamp-2 block text-[.95rem] text-[var(--ink-soft)]">{q.short}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="shell mt-20 grid gap-10 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 className="kicker">{c('courseTitle')}</h2>
          <p className="mt-3 text-[1.6rem] leading-snug">{c('courseBody')}</p>
          <Link href="/course" className="btn btn-ghost mt-6">{c('startHere')} →</Link>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(UNITS) as (keyof typeof UNITS)[]).map((u) => {
            const list = sessions.filter((s) => s.unit === u);
            return (
              <li key={u} className="card p-5">
                <span className="kicker kicker-accent">{pick({ en: 'Unit', es: 'Unidad', pt: 'Unidade' }, lang)} {u} · {list.length}</span>
                <span className="mt-2 block text-[1.15rem] font-medium">{pick(UNITS[u], lang)}</span>
                <span className="mt-1 block text-[.93rem] italic text-[var(--ink-soft)]">{pick(UNITS[u].q, lang)}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="shell mt-20">
        <div className="card grid gap-8 p-8 md:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="kicker">{c('honestTitle')}</h2>
            <p className="mt-3 text-[1.02rem] text-[var(--ink-soft)]">{c('honestBody')}</p>
            <Link href="/about/method" className="mt-4 inline-block">{pick({ en: 'How the work is done', es: 'Cómo se hace el trabajo', pt: 'Como o trabalho é feito' }, lang)} →</Link>
          </div>
          <ul className="flex flex-wrap content-start gap-2">
            {Object.values(CONFIDENCE).map((l) => (
              <li key={l.en} className="conf !text-[.72rem] !px-3 !py-1.5">{l[lang]}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="shell mt-20">
        <div className="max-w-[62ch] border-l-2 border-[var(--accent)] pl-6">
          <h2 className="kicker kicker-accent">{c('inviteTitle')}</h2>
          <p className="mt-3 text-[1.25rem] leading-relaxed">{c('inviteBody')}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/course/pathway/offer" className="btn">{c('inviteCta')}</Link>
            <Link href="/talk" className="btn btn-ghost">{c('talkCta')}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
