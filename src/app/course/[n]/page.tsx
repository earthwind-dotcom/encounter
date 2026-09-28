import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLang } from '@/lib/lang';
import { getSession, getSessions, renderMarkdown, UNITS } from '@/lib/content';
import { getCurrentUser } from '@/lib/session';
import { canFacilitate } from '@/lib/auth';
import { learnerState } from '@/lib/learner';
import { pick, t } from '@/lib/i18n';
import { LearnerTools } from '@/components/learner-tools';

export function generateStaticParams() {
  return getSessions().map((s) => ({ n: String(s.n) }));
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const s = getSession(Number((await params).n));
  return s ? { title: `Session ${s.n}: ${s.title}`, description: s.question } : {};
}

export default async function SessionPage({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n);
  const s = getSession(n);
  if (!s) notFound();
  const lang = await getLang();
  const all = getSessions();
  const prev = all.find((x) => x.n === n - 1);
  const next = all.find((x) => x.n === n + 1);
  const user = await getCurrentUser();
  const facilitator = canFacilitate(user);
  const tools = await learnerState(`course:${n}`, lang);

  return (
    <article className="shell pt-12" lang="en">
      <div className="max-w-[var(--measure)]">
        <p className="kicker">
          <Link href="/course" className="kicker kicker-accent">{t('navCourse', lang)}</Link> · Unit {s.unit}, {pick(UNITS[s.unit], lang)} · Session {String(n).padStart(2, '0')}
        </p>
        <h1 className="mt-3 text-[clamp(2rem,1.4rem+2.4vw,3rem)] font-medium leading-[1.1] tracking-[-.01em] text-balance">{s.title}</h1>
        {lang !== 'en' && <p className="article"><span className="xlate block">{t('notTranslated', lang)}</span></p>}

        {s.status !== 'published' && s.status !== 'reviewed' && (
          <p className="mt-6 rounded border border-dashed border-[var(--rule)] p-4 mono text-[.74rem] leading-relaxed text-[var(--faint)]">
            {s.status === 'outline'
              ? pick({ en: 'This session is an outline. The full guide is still being researched and written, so what follows is the plan: the question, the text, and what the session will cover.', es: 'Esta sesión es un esquema. La guía completa todavía se está investigando y escribiendo; lo que sigue es el plan: la pregunta, el texto y lo que cubrirá la sesión.', pt: 'Esta sessão é um esboço. O guia completo ainda está sendo pesquisado e escrito; o que segue é o plano: a pergunta, o texto e o que a sessão vai cobrir.' }, lang)
              : pick({ en: 'This session guide is written and awaiting review. Its sources are being checked before it is used with a group.', es: 'Esta guía está escrita y en espera de revisión. Sus fuentes se están verificando antes de usarla con un grupo.', pt: 'Este guia está escrito e aguardando revisão. Suas fontes estão sendo verificadas antes de ser usado com um grupo.' }, lang)}
          </p>
        )}

        <dl className="mt-8 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 border-y border-[var(--rule)] py-4 text-[.98rem]">
          <dt className="kicker pt-1">{pick({ en: 'Question', es: 'Pregunta', pt: 'Pergunta' }, lang)}</dt>
          <dd className="m-0 italic">{s.question}</dd>
          <dt className="kicker pt-1">{pick({ en: 'Text', es: 'Texto', pt: 'Texto' }, lang)}</dt>
          <dd className="m-0">{s.passage}</dd>
        </dl>

        <div className="prose mt-10" dangerouslySetInnerHTML={{ __html: renderMarkdown(s.participant, 'en') }} />

        {s.invitation && (
          <section className="mt-12 border-l-2 border-[var(--accent)] pl-5" aria-labelledby="invite">
            <h2 id="invite" className="kicker kicker-accent">{pick({ en: 'The invitation', es: 'La invitación', pt: 'O convite' }, lang)}</h2>
            <p className="mt-2 text-[1.08rem] leading-relaxed">
              {pick(
                {
                  en: 'This session makes the invitation plainly. If this is true, it isn’t neutral information: the claim is that Jesus is alive and asking you to trust him and follow him. You can respond today, in your own words. You can also say “not yet” and keep coming. Both are honest answers.',
                  es: 'Esta sesión hace la invitación con claridad. Si esto es verdad, no es información neutral: la afirmación es que Jesús está vivo y te pide que confíes en él y lo sigas. Puedes responder hoy, con tus propias palabras. También puedes decir «todavía no» y seguir viniendo. Las dos son respuestas honestas.',
                  pt: 'Esta sessão faz o convite com clareza. Se isso é verdade, não é informação neutra: a afirmação é que Jesus está vivo e pede que você confie nele e o siga. Você pode responder hoje, com suas palavras. Também pode dizer “ainda não” e continuar vindo. As duas são respostas honestas.',
                },
                lang,
              )}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/course/pathway/offer" className="btn">{pick({ en: 'What it means, in plain words', es: 'Qué significa, en palabras sencillas', pt: 'O que significa, em palavras simples' }, lang)}</Link>
              <Link href="/talk" className="btn btn-ghost">{t('navTalk', lang)}</Link>
            </div>
          </section>
        )}

        <LearnerTools {...tools} returnTo={`/course/${n}`} />

        {facilitator && s.facilitator && (
          <details className="card mt-12 p-5">
            <summary className="kicker kicker-accent cursor-pointer">{pick({ en: 'Facilitator guide', es: 'Guía para facilitadores', pt: 'Guia do facilitador' }, lang)}</summary>
            <div className="prose mt-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(s.facilitator, 'en') }} />
          </details>
        )}

        <nav className="no-print mt-12 grid grid-cols-2 gap-4" aria-label="Sessions">
          {prev ? (
            <Link href={`/course/${prev.n}`} className="card block p-4 text-[var(--ink)] hover:border-[var(--accent)]">
              <span className="kicker">← Session {prev.n}</span>
              <span className="mt-1 block text-[.98rem] leading-snug">{prev.title}</span>
            </Link>
          ) : <span />}
          {next && (
            <Link href={`/course/${next.n}`} className="card block p-4 text-right text-[var(--ink)] hover:border-[var(--accent)]">
              <span className="kicker">Session {next.n} →</span>
              <span className="mt-1 block text-[.98rem] leading-snug">{next.title}</span>
            </Link>
          )}
        </nav>
      </div>
    </article>
  );
}
