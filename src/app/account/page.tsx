import type { Metadata } from 'next';
import Link from 'next/link';
import { requireUser } from '@/lib/session';
import { getDb } from '@/lib/db';
import { canFacilitate } from '@/lib/auth';
import { getLibrary, getQuestions, getSessions } from '@/lib/content';
import { completedKeys } from '@/lib/learner';
import { deleteAccount, signOut } from '@/app/actions';
import { StagePicker } from '@/components/stage-picker';

export const metadata: Metadata = { title: 'Your path', robots: { index: false } };

/** Turns an item key back into a title and link, for the notes list. */
function describe(key: string): { title: string; href: string } {
  const [kind, id] = key.split(':');
  if (kind === 'course') {
    const s = getSessions().find((x) => String(x.n) === id);
    return { title: s ? `Session ${s.n}: ${s.title}` : key, href: `/course/${id}` };
  }
  if (kind === 'question') {
    const q = getQuestions('en').find((x) => x.slug === id);
    return { title: q?.title ?? key, href: `/questions/${id}` };
  }
  const [section, slug] = id.split('/');
  const a = getLibrary()[section]?.articles.find((x) => x.slug === slug);
  return { title: a?.title.en ?? key, href: `/library/${id}` };
}

export default async function Account() {
  const user = await requireUser('/account');
  const db = await getDb();
  const [done, stageRows, notes] = await Promise.all([
    completedKeys(user.id),
    db.query<{ stage: string }>('SELECT stage FROM journey_stage WHERE user_id = $1', [user.id]),
    db.query<{ item_key: string; body: string; updated_at: Date }>(
      'SELECT item_key, body, updated_at FROM notes WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 50',
      [user.id],
    ),
  ]);
  const sessions = getSessions();
  const nextSession = sessions.find((s) => !done.has(`course:${s.n}`));
  const courseDone = sessions.filter((s) => done.has(`course:${s.n}`)).length;
  const questionsDone = getQuestions('en').filter((q) => done.has(`question:${q.slug}`)).length;

  return (
    <div className="shell pt-12">
      <p className="kicker kicker-accent">Your path</p>
      <h1 className="mt-3 text-[clamp(2rem,1.5rem+2vw,2.8rem)] font-medium leading-tight">Good to see you, {user.name}.</h1>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Link href={nextSession ? `/course/${nextSession.n}` : '/course'} className="card block p-6 text-[var(--ink)] hover:border-[var(--accent)] lg:col-span-2">
          <span className="kicker">{nextSession ? 'Pick up where you left off' : 'You’ve finished the course'}</span>
          <span className="mt-2 block text-[1.5rem] leading-snug">
            {nextSession ? `Session ${nextSession.n}: ${nextSession.title}` : 'Keep going: Stage 2, practicing'}
          </span>
          {nextSession && <span className="mt-1 block italic text-[var(--ink-soft)]">{nextSession.question}</span>}
          <span className="mt-4 block h-1.5 rounded-full bg-[var(--rule)]">
            <span className="block h-full rounded-full bg-[var(--accent)]" style={{ width: `${(courseDone / sessions.length) * 100}%` }} />
          </span>
          <span className="kicker mt-2 block">{courseDone} of {sessions.length} sessions</span>
        </Link>
        <div className="card p-6">
          <span className="kicker">Hard questions read</span>
          <span className="mt-2 block text-[2.4rem] leading-none">{questionsDone}</span>
          <Link href="/questions" className="mt-4 inline-block">Browse questions →</Link>
        </div>
      </div>

      <section className="mt-14 max-w-3xl" aria-labelledby="stage">
        <h2 id="stage" className="text-[1.4rem] font-medium">Where are you with following Jesus?</h2>
        <p className="mt-1 text-[.98rem] text-[var(--ink-soft)]">
          Only you can see this. There’s no wrong answer, and you can change it any time. If you pick “Ready to start,” you might want to{' '}
          <Link href="/course/pathway/offer">read what it means in plain words</Link> or <Link href="/talk">talk to someone</Link>.
        </p>
        <StagePicker initial={stageRows[0]?.stage ?? null} />
      </section>

      <section className="mt-14 max-w-3xl" aria-labelledby="notes">
        <h2 id="notes" className="text-[1.4rem] font-medium">Your notes</h2>
        {notes.length === 0 ? (
          <p className="mt-2 text-[var(--ink-soft)]">Notes you write on any session, question or article will collect here.</p>
        ) : (
          <ul className="mt-3 list-none p-0">
            {notes.map((n) => {
              const d = describe(n.item_key);
              return (
                <li key={n.item_key} className="border-t border-[var(--rule)] py-4">
                  <Link href={d.href} className="font-medium">{d.title}</Link>
                  <p className="mt-1 line-clamp-3 whitespace-pre-line text-[.95rem] text-[var(--ink-soft)]">{n.body}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-14 flex flex-wrap items-center gap-4 border-t border-[var(--rule)] pt-6">
        {canFacilitate(user) && <Link href="/facilitate" className="btn btn-ghost">Facilitator desk</Link>}
        <form action={signOut}><button className="btn btn-ghost">Sign out</button></form>
        <details className="text-[.95rem]">
          <summary className="cursor-pointer text-[var(--faint)]">Delete my account</summary>
          <form action={deleteAccount} className="mt-3">
            <p className="mb-3 max-w-md text-[var(--ink-soft)]">This permanently deletes your account, progress, notes and stage. It can’t be undone.</p>
            <button className="btn">Delete everything</button>
          </form>
        </details>
      </section>
    </div>
  );
}
