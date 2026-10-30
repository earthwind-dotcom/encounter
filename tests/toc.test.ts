import { describe, expect, it } from 'vitest';
import { promoteLeadLabels, withToc } from '@/lib/toc';

describe('withToc', () => {
  it('gives each h2 a stable, unique id and lists it', () => {
    const { html, toc } = withToc('<h2>Where this leaves you</h2><p>x</p><h2>Qué <em>dice</em></h2><h2>Where this leaves you</h2>');
    expect(toc.map((t) => t.id)).toEqual(['where-this-leaves-you', 'que-dice', 'where-this-leaves-you-2']);
    expect(toc[1].text).toBe('Qué dice');
    expect(html).toContain('<h2 id="que-dice">Qué <em>dice</em></h2>');
  });

  it('leaves HTML without headings alone', () => {
    expect(withToc('<p>plain</p>')).toEqual({ html: '<p>plain</p>', toc: [] });
  });
});

describe('promoteLeadLabels', () => {
  it('turns a bold label on its own line into a heading', () => {
    expect(promoteLeadLabels('<p><strong>The question</strong>\nWhat do they mean?</p>')).toBe('<h2>The question</h2><p>What do they mean?</p>');
    expect(promoteLeadLabels('<p><strong>The texts</strong></p>\n<ul></ul>')).toBe('<h2>The texts</h2>\n<ul></ul>');
  });

  it('leaves a bold run-in phrase alone', () => {
    const html = "<p><strong>Paul's letters.</strong> The earliest writings.</p>";
    expect(promoteLeadLabels(html)).toBe(html);
  });
});
