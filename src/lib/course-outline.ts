import 'server-only';
import { getSessions, UNITS, type Session } from './content';
import { pick, type Lang } from './i18n';
import type { OutlineModule } from '@/components/lms/types';

export const sessionKey = (n: number) => `course:${n}`;

/** Encounter's units and sessions in the shape the LMS components take. */
export function courseModules(lang: Lang, done: Set<string>, sessions: Session[] = getSessions(lang)): OutlineModule[] {
  return (Object.keys(UNITS) as (keyof typeof UNITS)[]).map((u) => ({
    id: u,
    badge: u,
    title: pick(UNITS[u], lang),
    lessons: sessions
      .filter((s) => s.unit === u)
      .map((s) => ({
        id: sessionKey(s.n),
        href: `/course/${s.n}`,
        n: s.n,
        title: s.title,
        done: done.has(sessionKey(s.n)),
        minutes: s.minutes,
        media: s.media?.kind,
      })),
  }));
}
