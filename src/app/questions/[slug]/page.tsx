import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLang } from '@/lib/lang';
import { getQuestion, getQuestions, renderMarkdown, withBadges } from '@/lib/content';
import { learnerState } from '@/lib/learner';
import { pick, t } from '@/lib/i18n';
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

  return (
    <article className="shell grid gap-12 pt-12 lg:grid-cols-[1fr_300px]" lang={q.lang}>
      <div className="min-w-0">
        <p className="kicker">
          <Link href="/questions" className="kicker kicker-accent">{t('navQuestions', lang)}</Link> · {String(q.order).padStart(2, '0')}
        </p>
        <h1 className="mt-3 max-w-[24ch] text-[clamp(2rem,1.4rem+2.4vw,3rem)] font-medium leading-[1.1] tracking-[-.01em] text-balance">
          {q.title}
        </h1>
        {!q.translated && lang !== 'en' && <p className="article"><span className="xlate block">{t('notTranslated', lang)}</span></p>}

        <section className="mt-8 max-w-[var(--measure)] border-l-2 border-[var(--accent)] pl-5" aria-labelledby="short">
          <h2 id="short" className="kicker kicker-accent">{t('shortAnswer', lang)}</h2>
          <p className="mt-2 text-[1.25rem] leading-relaxed">{q.short}</p>
        </section>

        <div className="prose mt-10" dangerouslySetInnerHTML={{ __html: renderMarkdown(q.body, lang) }} />

        {q.standing.length > 0 && (
          <section className="article" aria-labelledby="standing">
            <div className="apparatus max-w-[var(--measure)]">
              <h3 id="standing">{t('standing', lang)}</h3>
              <ul className="m-0 list-none p-0">
                {q.standing.map((s, k) => (
                  <li key={k} className="border-t border-[var(--rule)] py-3 text-[.98rem] leading-normal text-[var(--ink-soft)] first:border-t-0 first:pt-0">
                    <span dangerouslySetInnerHTML={{ __html: withBadges(`[${s.label}]`, lang) }} /> {s.claim}
                  </li>
                ))}
              </ul>
              {q.reading.length > 0 && (
                <div className="sources">
                  <span className="k">{t('furtherReading', lang)}</span>
                  <ul className="mt-2 list-none p-0">
                    {q.reading.map((r, k) => (
                      <li key={k} className="py-1" dangerouslySetInnerHTML={{ __html: inline.parseInline(r) as string }} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        <div className="max-w-[var(--measure)]">
          <LearnerTools {...tools} returnTo={`/questions/${slug}`} />
        </div>
      </div>

      <aside className="no-print lg:sticky lg:top-8 lg:self-start">
        {q.related.length > 0 && (
          <nav aria-labelledby="related" className="card p-5">
            <h2 id="related" className="kicker">{t('related', lang)}</h2>
            <ul className="mt-3 list-none p-0">
              {q.related.map((r) => (
                <li key={r.href} className="border-t border-[var(--rule)] py-2 text-[.95rem] leading-snug first:border-t-0">
                  <Link href={r.href}>{r.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {next && next.slug !== slug && (
          <Link href={`/questions/${next.slug}`} className="card mt-4 block p-5 text-[var(--ink)] hover:border-[var(--accent)]">
            <span className="kicker">{pick({ en: 'Next question', es: 'Siguiente pregunta', pt: 'Próxima pergunta' }, lang)}</span>
            <span className="mt-2 block text-[1.02rem] leading-snug">{next.title}</span>
          </Link>
        )}
        <Link href="/talk" className="mt-4 block p-1 text-[.95rem] italic">
          {t('navTalk', lang)} →
        </Link>
      </aside>
    </article>
  );
}
