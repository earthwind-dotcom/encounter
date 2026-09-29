import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLang } from '@/lib/lang';
import { getAboutMd, getAboutPages, renderMarkdown } from '@/lib/content';
import { pick, t } from '@/lib/i18n';
import { ArticleHtml } from '@/components/article-html';

export function generateStaticParams() {
  return getAboutPages().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getAboutPages().find((x) => x.slug === slug);
  return a ? { title: pick(a.title, await getLang()) } : {};
}

export default async function AboutArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lang = await getLang();
  const pages = getAboutPages();
  const page = pages.find((p) => p.slug === slug);
  if (!page) notFound();
  const doc = page.md ? getAboutMd(slug, lang) : null;

  return (
    <div className="shell grid gap-10 pt-10 lg:grid-cols-[220px_1fr] lg:gap-16">
      <nav aria-label={t('navAbout', lang)} className="no-print lg:sticky lg:top-8 lg:self-start">
        <p className="kicker mb-4">{t('navAbout', lang)}</p>
        <ol className="flex list-none flex-wrap gap-2 p-0 lg:block">
          {pages.map((p) => {
            const current = p.slug === slug;
            return (
              <li key={p.slug}>
                <Link
                  href={`/about/${p.slug}`}
                  aria-current={current ? 'page' : undefined}
                  className={`block py-1.5 text-[.95rem] leading-snug lg:-ml-4 lg:border-l-2 lg:pl-3.5 ${
                    current ? 'text-[var(--ink)] lg:border-[var(--accent)]' : 'text-[var(--ink-soft)] lg:border-transparent'
                  } max-lg:rounded max-lg:border max-lg:border-[var(--rule)] max-lg:px-2.5`}
                >
                  <span className="mono hidden text-[.66rem] text-[var(--faint)] lg:block">{p.n}</span>
                  {pick(p.title, lang)}
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="min-w-0 max-w-[var(--measure)] pb-10">
        {page.html ? (
          <ArticleHtml html={page.html} />
        ) : (
          doc && (
            <article className="article" lang={doc.lang}>
              {doc.lang !== lang && <p className="xlate">{t('notTranslated', lang)}</p>}
              <p className="eyebrow">{doc.md.eyebrow}</p>
              <h1>{doc.title}</h1>
              {doc.md.lede && <p className="lede">{doc.md.lede}</p>}
              {doc.md.revised && (
                <p className="entrydate">
                  {pick({ en: 'Revised', es: 'Revisado', pt: 'Revisado' }, lang)} {doc.md.revised}
                </p>
              )}
              <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(doc.md.body, doc.lang) }} />
            </article>
          )
        )}
      </div>
    </div>
  );
}
