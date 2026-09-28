import { describe, expect, it } from 'vitest';
import { fold, search } from '@/lib/search';

describe('search', () => {
  it('ignores case and accents', () => {
    expect(fold('Jesús ÉL')).toBe('jesus el');
  });
  it('finds a hard question by its subject and ranks it first', () => {
    const hits = search('resurrection', 'en');
    expect(hits[0].href).toBe('/questions/resurrection');
  });
  it('finds Spanish content without accents typed', () => {
    expect(search('resurreccion', 'es').some((h) => h.href === '/questions/resurrection')).toBe(true);
  });
  it('requires every term to match', () => {
    expect(search('tacitus xyzzyqq', 'en')).toHaveLength(0);
    expect(search('tacitus pilate', 'en').length).toBeGreaterThan(0);
  });
  it('reaches the imported library', () => {
    expect(search('praus', 'en').some((h) => h.href === '/library/roots/praus')).toBe(true);
  });
});
