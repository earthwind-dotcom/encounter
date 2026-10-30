/**
 * Gives each <h2> in rendered HTML an id and returns the list, for an "On this page" menu.
 * The HTML is our own rendered Markdown, never user input.
 */
export interface TocItem {
  id: string;
  text: string;
}

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z#0-9]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'section';

export function withToc(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const seen = new Map<string, number>();
  const out = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner: string) => {
    const base = slugify(inner);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    const id = n ? `${base}-${n + 1}` : base;
    toc.push({ id, text: inner.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, '’').replace(/&quot;/g, '"').trim() });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: out, toc };
}

/**
 * Session guides mark their sections with a bold label on its own line (`**The question**`).
 * This turns those labels into real <h2> headings, so they get anchors and structure.
 * A bold phrase that runs on into its sentence ("**Paul's letters.** The earliest…") is left alone.
 */
export function promoteLeadLabels(html: string): string {
  return html
    .replace(/<p><strong>([^<]{1,80})<\/strong><\/p>/g, '<h2>$1</h2>')
    .replace(/<p><strong>([^<]{1,80})<\/strong>\n/g, '<h2>$1</h2><p>');
}
