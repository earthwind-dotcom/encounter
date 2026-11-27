# LMS components

The course experience, written so it can run a course other than Encounter's. The first planned
reuse is a video course of about 50 lessons. Nothing in this folder imports Encounter content,
languages or copy: a page maps its own content into the shapes in `types.ts` and passes labels in.

| Component | What it does |
|---|---|
| `CourseOutline` | Rail beside a lesson: modules, lessons, ticks, progress bar. Collapses to a panel on phones. Pass `key={currentId}`. |
| `LessonSteps` | The lesson's `<h2>` sections as a sticky row of steps, lit as you scroll. Feed it `withToc()` output. |
| `LessonMedia` | Video or audio talk: native controls, captions track, resume where you stopped (localStorage), speed, `onMostlyDone` at 90%. |
| `LessonComplete` | End-of-lesson panel: complete and continue in one press. Also a phone bar fixed to the bottom with prev / complete / next. |
| `JourneyTrack` | The whole course as one path of nodes, done ones filled and the next one glowing. For the course home. |
| `PracticeCheckin`, `PracticeCalendar` | "I did it today" with a seven-day strip and streak; a four-week grid for the dashboard. |
| `PrintButton` | Prints the lesson as a handout (see `@media print` in `globals.css`). |

## What a host app provides

- **Progress**: the `toggleProgress(itemKey, done)` and `logPractice(itemKey, day, on)` server actions
  (`src/app/actions.ts`), and the `progress` and `practice_log` tables (`src/lib/migrations.ts`).
- **Tokens**: the CSS variables at the top of `globals.css` (`--accent`, `--gold`, `--ok`, `--glass*`,
  `--rule*`, `--ink*`) and the `.glass`, `.glass-strong`, `.btn`, `.pill`, `.kicker` classes. Re-skin a
  course by redefining the tokens; the components only use the variables.
- **An adapter** from content to `OutlineModule[]`. Encounter's is `src/lib/course-outline.ts` (units
  become modules, sessions become lessons).

## Lesson media

Lessons take an optional `media` block in their frontmatter:

```yaml
media:
  kind: video            # or audio
  src: /media/lesson-01.mp4
  poster: /media/lesson-01.jpg
  captions: /media/lesson-01.en.vtt   # required for video
  minutes: 8
```

Host the files yourself (or on a storage bucket / CDN you control), as H.264 MP4 at 1080p and
720p if bandwidth matters, so there is no third-party player, tracking or ads. Every video ships
with a WebVTT captions file. For a course of ~50 videos, Cloudflare R2 or Stream is the likely
home; only `src` changes.

## Starting a new course from this

1. Copy the app, keep `src/components/lms`, `src/lib/{auth,db,migrations,session,email,practice}.ts`.
2. Replace `content/` and write an adapter like `course-outline.ts`.
3. Redefine the color tokens and fonts for the new brand.
4. Keep the rules that make it trustworthy: a public front door that shows what's inside, a free
   account to enter (`requireMember` in `src/lib/session.ts`), no third-party scripts.
