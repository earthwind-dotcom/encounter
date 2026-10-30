import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLang } from '@/lib/lang';
import { getQuestion, getQuestions, renderMarkdown, withBadges } from '@/lib/content';
import { learnerState } from '@/lib/learner';
import { pick, t } from '@/lib/i18n';
import { withToc } from '@/lib/toc';
import { ArrowRight, BookMarked, MessageCircle, Scale, Zap } from 'lucide-react';
import { IconTile, PageHeader } from '@/components/ui';
import { ReadingProgress, Toc } from '@/components/reading';
import { LearnerTools } from '@/components/learner-tools';
import { Marked } from 'marked';

const inline = new Marked();

export function generateStaticParams() {
  return getQuestions('en').map((q) => ({ slug: q.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const q = getQuestion((await params).slug);
  return q ? { title: q.title, description: q.short, openGraph: { title: q.title, description: q.short, type: 'article' } } : {};
}

export default async function QuestionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lang = await getLang();
  const q = getQuestion(slug, lang);
  if (!q) notFound();
  const all = getQuestions(lang);
  const i = all.findIndex((x) => x.slug === slug);
  const next = all[(i + 1) % all.length];
  const tools = await learnerState(`question:${slug}`, lang);

  const { html, toc } = withToc(renderMarkdown(q.body, lang));
  const onPage = pick({ en: 'On this page', es: 'En esta página', pt: 'Nesta página' }, lang);

  return (
    <article className="shell pt-8" lang={q.lang}>
      <ReadingProgress />
      <PageHeader
        crumb={{ href: '/questions', label: t('navQuestions', lang) }}
        kicker={`${pick({ en: 'Question', es: 'Pregunta', pt: 'Pergunta' }, lang)} ${String(q.order).padStart(2, '0')}`}
        title={q.title}
        className="!pt-6 [&_h1]:max-w-[26ch]"
      >
        {!q.translated && lang !== 'en' && <p className="article"><span className="xlate block">{t('notTranslated', lang)}</span></p>}
      </PageHeader>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_290px]">
        <div className="min-w-0 space-y-6">
          <section className="glass-strong rise rise-1 relative overflow-hidden rounded-[24px] p-6 sm:p-8" aria-labelledby="short">
            <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[var(--accent)] to-[var(--gold)]" />
            <h2 id="short" className="kicker kicker-accent flex items-center gap-2"><Zap size={13} /> {t('shortAnswer', lang)}</h2>
            <p className="mt-3 max-w-[60ch] text-[1.28rem] leading-relaxed">{q.short}</p>
          </section>

          <div className="glass rise rise-2 rounded-[24px] p-6 sm:p-10">
            <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

            {q.standing.length > 0 && (
              <section className="mt-12" aria-labelledby="standing">
                <div className="well max-w-[var(--measure)] p-5 sm:p-7">
                  <h3 id="standing" className="kicker flex items-center gap-2"><Scale size={13} /> {t('standing', lang)}</h3>
                  <ul className="mt-4 list-none space-y-0 p-0">
                    {q.standing.map((s, k) => (
                      <li key={k} className="border-t border-[var(--rule)] py-3.5 text-[.98rem] leading-normal text-[var(--ink-soft)] first:border-t-0 first:pt-0">
                        <span dangerouslySetInnerHTML={{ __html: withBadges(`[${s.label}]`, lang) }} /> {s.claim}
                      </li>
                    ))}
                  </ul>
                  {q.reading.length > 0 && (
                    <div className="mt-5 border-t border-[var(--rule)] pt-5">
                      <p className="kicker flex items-center gap-2"><BookMarked size={13} /> {t('furtherReading', lang)}</p>
                      <ul className="mono mt-3 list-none space-y-1.5 p-0 text-[.76rem] leading-relaxed text-[var(--faint)]">
                        {q.reading.map((r, k) => (
                          <li key={k} dangerouslySetInnerHTML={{ __html: inline.parseInline(r) as string }} />
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          <LearnerTools {...tools} returnTo={`/questions/${slug}`} />
        </div>

        <aside className="no-print space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Toc items={toc} label={onPage} />
          {q.related.length > 0 && (
            <nav aria-labelledby="related" className="glass p-5">
              <h2 id="related" className="kicker">{t('related', lang)}</h2>
              <ul className="mt-3 list-none space-y-1 p-0">
                {q.related.map((r) => (
                  <li key={r.href}>
                    <Link href={r.href} className="sans group flex items-start gap-2 rounded-lg py-1.5 text-[.88rem] leading-snug">
                      <ArrowRight size={14} className="mt-0.5 shrink-0 text-[var(--faint)] group-hover:text-[var(--accent)]" /> {r.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {next && next.slug !== slug && (
            <Link href={`/questions/${next.slug}`} className="glass lift group block p-5 text-[var(--ink)]">
              <span className="kicker">{pick({ en: 'Next question', es: 'Siguiente pregunta', pt: 'Próxima pergunta' }, lang)}</span>
              <span className="mt-2 block text-[1.04rem] font-medium leading-snug">{next.title}</span>
              <ArrowRight size={16} className="mt-3 text-[var(--accent)] transition-transform group-hover:translate-x-1" />
            </Link>
          )}
          <Link href="/talk" className="glass lift flex items-center gap-3 p-4 text-[var(--ink)]">
            <IconTile className="!h-9 !w-9 !rounded-xl"><MessageCircle size={16} /></IconTile>
            <span className="sans text-[.88rem] font-medium">{t('navTalk', lang)}</span>
          </Link>
        </aside>
      </div>
    </article>
  );
}
