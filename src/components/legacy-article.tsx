import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLibrary, getLibraryArticle } from '@/lib/content';
import { learnerState } from '@/lib/learner';
import { pick, t, type Lang } from '@/lib/i18n';
import { ArticleHtml } from './article-html';
import { LearnerTools } from './learner-tools';
import { ReadingProgress } from './reading';

/**
 * One imported Marginalia article with its section's contents alongside, the same
 * two-column reading layout the original site used.
 */
export async function LegacyArticle({
  section,
  base,
  slug,
  label,
  parent,
  lang,
  track = true,
}: {
  section: string;
  base: string;
  slug: string;
  label: string;
  parent?: { href: string; label: string };
  lang: Lang;
  track?: boolean;
}) {
  const article = getLibraryArticle(section, slug);
  if (!article) notFound();
  const list = getLibrary()[section].articles;
  const tools = track ? await learnerState(`library:${section}/${slug}`, lang) : null;

  return (
    <div className="shell grid gap-8 pt-10 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
      <ReadingProgress />
      <nav aria-label={label} className="no-print lg:sticky lg:top-24 lg:self-start">
        <div className="glass p-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
          <p className="kicker mb-3 px-2">
            {parent && (
              <>
                <Link href={parent.href} className="kicker kicker-accent">{parent.label}</Link> <span className="text-[var(--rule-strong)]">/</span>{' '}
              </>
            )}
            {label}
          </p>
          <ol className="-mx-1 flex list-none gap-1.5 overflow-x-auto p-0 px-1 pb-1 lg:mx-0 lg:block lg:space-y-0.5 lg:overflow-visible lg:px-0 lg:pb-0">
            {list.map((a) => {
              const current = a.slug === slug;
              return (
                <li key={a.slug}>
                  <Link
                    href={`${base}/${a.slug}`}
                    aria-current={current ? 'page' : undefined}
                    className={`block rounded-xl px-2.5 py-2 text-[.9rem] leading-snug transition-colors ${
                      current ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--ink-soft)] hover:bg-[var(--glass-inner-hover)] hover:text-[var(--ink)]'
                    } max-lg:whitespace-nowrap max-lg:border max-lg:border-[var(--rule)]`}
                  >
                    <span className="mono hidden text-[.62rem] text-[var(--faint)] lg:block">{a.n}</span>
                    {pick(a.title, lang)}
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
      <div className="min-w-0 space-y-6 pb-10">
        <div className="glass rise rounded-[24px] p-6 sm:p-10 lg:p-12">
          <div className="max-w-[var(--measure)]">
            <ArticleHtml html={article.html} />
          </div>
        </div>
        {tools && <LearnerTools {...tools} notes={section === 'reflections' || section === 'roots' || section === 'provenance'} returnTo={`${base}/${slug}`} />}
        <p className="sr-only">{t('navLibrary', lang)}</p>
      </div>
    </div>
  );
}
