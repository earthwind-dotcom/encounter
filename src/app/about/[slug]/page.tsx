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
    <div className="shell grid gap-8 pt-10 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
      <nav aria-label={t('navAbout', lang)} className="no-print lg:sticky lg:top-24 lg:self-start">
        <div className="glass p-4">
        <p className="kicker mb-3 px-2">{t('navAbout', lang)}</p>
        <ol className="-mx-1 flex list-none gap-1.5 overflow-x-auto p-0 px-1 pb-1 lg:mx-0 lg:block lg:space-y-0.5 lg:overflow-visible lg:px-0 lg:pb-0">
          {pages.map((p) => {
            const current = p.slug === slug;
            return (
              <li key={p.slug}>
                <Link
                  href={`/about/${p.slug}`}
                  aria-current={current ? 'page' : undefined}
                  className={`block rounded-xl px-2.5 py-2 text-[.9rem] leading-snug transition-colors ${
                    current ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--ink-soft)] hover:bg-[var(--glass-inner-hover)] hover:text-[var(--ink)]'
                  } max-lg:whitespace-nowrap max-lg:border max-lg:border-[var(--rule)]`}
                >
                  <span className="mono hidden text-[.62rem] text-[var(--faint)] lg:block">{p.n}</span>
                  {pick(p.title, lang)}
                </Link>
              </li>
            );
          })}
        </ol>
        </div>
      </nav>
      <div className="glass rise min-w-0 rounded-[24px] p-6 sm:p-10 lg:p-12">
        <div className="max-w-[var(--measure)]">
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
    </div>
  );
}
