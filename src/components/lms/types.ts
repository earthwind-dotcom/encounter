/**
 * The shapes the LMS components work with. They know nothing about Encounter's content
 * (sessions, units, languages): a page maps its own content into these and passes labels in,
 * so the same components can run another course (see ./README.md).
 */
export interface OutlineLesson {
  /** Stable key, also the progress item key (e.g. "course:3"). */
  id: string;
  href: string;
  /** Position shown in the node ("03"). */
  n: number;
  title: string;
  done: boolean;
  minutes?: number;
  /** The lesson has a video or audio talk. */
  media?: 'video' | 'audio';
}

export interface OutlineModule {
  id: string;
  /** Short badge, e.g. "A" or "1". */
  badge: string;
  title: string;
  lessons: OutlineLesson[];
}

export interface LessonStep {
  id: string;
  text: string;
}
