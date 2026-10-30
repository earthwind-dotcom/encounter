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
import { promoteLeadLabels, withToc } from '@/lib/toc';
import { ArrowLeft, ArrowRight, BookOpen, ChevronDown, DoorOpen, HelpCircle, MessageCircle, PencilLine, Users } from 'lucide-react';
import { IconTile, PageHeader } from '@/components/ui';
import { ReadingProgress, Toc } from '@/components/reading';
import { Marked } from 'marked';

// Session passages are our own frontmatter; italics mark book titles (*Annals*).
const inline = new Marked();
const SESSION = { en: 'Session', es: 'Sesión', pt: 'Sessão' };
const UNIT = { en: 'Unit', es: 'Unidad', pt: 'Unidade' };

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
  const tools = await learnerState(`course:${n}`, lang);

  const { html, toc } = withToc(promoteLeadLabels(renderMarkdown(s.participant, textLang)));
  const unitList = all.filter((x) => x.unit === s.unit);

  return (
    <article className="shell pt-8" lang={textLang}>
      <ReadingProgress />
      <PageHeader
        crumb={{ href: '/course', label: t('navCourse', lang) }}
        kicker={`${pick(UNIT, lang)} ${s.unit} · ${pick(SESSION, lang)} ${String(n).padStart(2, '0')}`}
        title={s.title}
        className="!pt-6 [&_h1]:max-w-[26ch]"
      >
        {!s.translated && <p className="article"><span className="xlate block">{t('notTranslated', lang)}</span></p>}
      </PageHeader>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_290px]">
        <div className="min-w-0 space-y-6">
          <div className="rise rise-1 grid gap-4 sm:grid-cols-2">
            <div className="glass-strong flex gap-4 rounded-[22px] p-5">
              <IconTile><HelpCircle size={19} /></IconTile>
              <div>
                <p className="kicker">{pick({ en: 'Question', es: 'Pregunta', pt: 'Pergunta' }, lang)}</p>
                <p className="mt-1 text-[1.08rem] italic leading-snug">{s.question}</p>
              </div>
            </div>
            <div className="glass-strong flex gap-4 rounded-[22px] p-5">
              <IconTile><BookOpen size={19} /></IconTile>
              <div>
                <p className="kicker">{pick({ en: 'Text', es: 'Texto', pt: 'Texto' }, lang)}</p>
                <p className="mt-1 text-[1.08rem] leading-snug" dangerouslySetInnerHTML={{ __html: inline.parseInline(s.passage) as string }} />
              </div>
            </div>
          </div>

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
            <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
          </div>

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

          <LearnerTools {...tools} returnTo={`/course/${n}`} />

          {facilitator && s.facilitator && (
            <details className="glass group p-5 sm:p-7">
              <summary className="sans flex cursor-pointer list-none items-center gap-3 font-medium text-[var(--accent)]">
                <Users size={17} /> {pick({ en: 'Facilitator guide', es: 'Guía para facilitadores', pt: 'Guia do facilitador' }, lang)}
                <ChevronDown size={16} className="ml-auto transition-transform group-open:rotate-180" />
              </summary>
              <div className="prose mt-6" dangerouslySetInnerHTML={{ __html: promoteLeadLabels(renderMarkdown(s.facilitator, textLang)) }} />
            </details>
          )}

          <nav className="no-print grid gap-4 sm:grid-cols-2" aria-label={pick({ en: 'Sessions', es: 'Sesiones', pt: 'Sessões' }, lang)}>
            {prev ? (
              <Link href={`/course/${prev.n}`} className="glass lift group block p-5 text-[var(--ink)]">
                <span className="kicker flex items-center gap-1.5"><ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" /> {pick(SESSION, lang)} {prev.n}</span>
                <span className="mt-2 block text-[1rem] font-medium leading-snug">{prev.title}</span>
              </Link>
            ) : <span className="hidden sm:block" />}
            {next && (
              <Link href={`/course/${next.n}`} className="glass lift group block p-5 text-right text-[var(--ink)]">
                <span className="kicker flex items-center justify-end gap-1.5">{pick(SESSION, lang)} {next.n} <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" /></span>
                <span className="mt-2 block text-[1rem] font-medium leading-snug">{next.title}</span>
              </Link>
            )}
          </nav>
        </div>

        <aside className="no-print space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Toc items={toc} label={pick({ en: 'In this session', es: 'En esta sesión', pt: 'Nesta sessão' }, lang)} />
          <nav className="glass p-5" aria-label={pick(UNITS[s.unit], lang)}>
            <p className="kicker">{pick(UNIT, lang)} {s.unit} · {pick(UNITS[s.unit], lang)}</p>
            <ol className="mt-3 list-none space-y-1 p-0">
              {unitList.map((x) => (
                <li key={x.n}>
                  <Link
                    href={`/course/${x.n}`}
                    aria-current={x.n === n ? 'page' : undefined}
                    className={`sans flex gap-2.5 rounded-xl px-2 py-1.5 text-[.85rem] leading-snug ${x.n === n ? 'bg-[var(--accent-soft)] font-medium text-[var(--accent)]' : 'text-[var(--ink-soft)] hover:bg-[var(--glass-inner-hover)] hover:text-[var(--ink)]'}`}
                  >
                    <span className="mono shrink-0 pt-px text-[.72rem]">{String(x.n).padStart(2, '0')}</span> {x.title}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
      </div>
    </article>
  );
}
