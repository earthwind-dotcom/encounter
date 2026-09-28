import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLibrary, getLibraryArticle } from '@/lib/content';
import { learnerState } from '@/lib/learner';
import { pick, t, type Lang } from '@/lib/i18n';
import { ArticleHtml } from './article-html';
import { LearnerTools } from './learner-tools';

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
    <div className="shell grid gap-10 pt-10 lg:grid-cols-[220px_1fr] lg:gap-16">
      <nav aria-label={label} className="no-print lg:sticky lg:top-8 lg:self-start">
        <p className="kicker mb-4">
          {parent && (
            <>
              <Link href={parent.href} className="kicker kicker-accent">{parent.label}</Link> ·{' '}
            </>
          )}
          {label}
        </p>
        <ol className="flex list-none flex-wrap gap-2 p-0 lg:block">
          {list.map((a) => {
            const current = a.slug === slug;
            return (
              <li key={a.slug}>
                <Link
                  href={`${base}/${a.slug}`}
                  aria-current={current ? 'page' : undefined}
                  className={`block border-[var(--accent)] py-1.5 text-[.95rem] leading-snug lg:-ml-4 lg:border-l-2 lg:pl-3.5 ${
                    current ? 'text-[var(--ink)] lg:border-[var(--accent)]' : 'text-[var(--ink-soft)] lg:border-transparent'
                  } max-lg:rounded max-lg:border max-lg:border-[var(--rule)] max-lg:px-2.5`}
                >
                  <span className="mono mr-1 hidden text-[.66rem] text-[var(--faint)] lg:block">{a.n}</span>
                  {pick(a.title, lang)}
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="min-w-0 max-w-[var(--measure)] pb-10">
        <ArticleHtml html={article.html} />
        {tools && <LearnerTools {...tools} notes={section === 'reflections' || section === 'roots' || section === 'provenance'} returnTo={`${base}/${slug}`} />}
        <p className="sr-only">{t('navLibrary', lang)}</p>
      </div>
    </div>
  );
}
