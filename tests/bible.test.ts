import { describe, expect, it } from 'vitest';
import { getPassage, parseRefs } from '@/lib/bible';

describe('passage references', () => {
  it('reads books, ranges, cross-chapter ranges and same-book continuations', () => {
    const refs = parseRefs('Mark 11:15–18 (the temple), then the trial in Mark 14:53–65 and 15:1–15.');
    expect(refs.map((r) => r.label)).toEqual(['Mark 11:15–18', 'Mark 14:53–65', 'Mark 15:1–15']);
    expect(parseRefs('Mark 10:45; Romans 3:21–26; Isaiah 52:13–53:12.').map((r) => r.label)).toEqual(['Mark 10:45', 'Romans 3:21–26', 'Isaiah 52:13–53:12']);
    expect(parseRefs('John 1:1–14; 2 Timothy 3:16; Luke 24:27.').map((r) => r.book)).toEqual(['JHN', '2TI', 'LUK']);
  });
  it('ignores non-biblical references', () => {
    expect(parseRefs('Mark 1:1–15, alongside Tacitus (*Annals* 15.44) and Josephus (*Antiquities* 18.3.3).').map((r) => r.label)).toEqual(['Mark 1:1–15']);
  });
  it('returns the verses, across a chapter break', () => {
    const [isa] = parseRefs('Isaiah 52:13–53:12');
    const v = getPassage(isa);
    expect(v[0]).toMatchObject({ chapter: 52, verse: 13 });
    expect(v.at(-1)).toMatchObject({ chapter: 53, verse: 12 });
    expect(v).toHaveLength(15);
  });
  it('every session passage resolves to real verses', async () => {
    const { getSessions } = await import('@/lib/content');
    for (const s of getSessions('en')) {
      const refs = parseRefs(s.passage);
      expect(refs.length, `session ${s.n}`).toBeGreaterThan(0);
      for (const r of refs) expect(getPassage(r).length, r.label).toBeGreaterThan(0);
    }
  });
});
