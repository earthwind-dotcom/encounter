import type { Metadata } from 'next';
import Link from 'next/link';
import { requireFacilitator } from '@/lib/session';
import { getDb } from '@/lib/db';
import { cohortProgress, cohortsForFacilitator } from '@/lib/cohorts';
import { getSessions } from '@/lib/content';
import { archiveCohortAction } from '@/app/actions';
import { CreateCohortForm } from '@/components/cohort-forms';

export const metadata: Metadata = { title: 'Groups', robots: { index: false } };

export default async function Groups() {
  const me = await requireFacilitator();
  const db = await getDb();
  const cohorts = await cohortsForFacilitator(db, me);
  const progress = await Promise.all(cohorts.map((c) => cohortProgress(db, c.id)));
  const sessions = getSessions();

  return (
    <div className="shell pt-12">
      <p className="kicker"><Link href="/facilitate" className="kicker kicker-accent">Facilitator desk</Link> · groups</p>
      <h1 className="mt-3 text-[2.4rem] font-medium leading-tight">Groups</h1>
      <p className="mt-2 max-w-2xl text-[var(--ink-soft)]">
        A group is a table working through the course together. Give people the code; they join from their own page. You’ll see which
        sessions each person has marked done, so you know who to check in with. You will never see their notes or where they are with
        following Jesus. That stays theirs.
      </p>
      <div className="mt-6"><CreateCohortForm /></div>

      {cohorts.length === 0 && <p className="mt-8 text-[var(--ink-soft)]">No groups yet.</p>}
      {cohorts.map((c, i) => (
        <section key={c.id} className={`card mt-8 p-5 ${c.archived ? 'opacity-60' : ''}`} aria-labelledby={`g-${c.id}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id={`g-${c.id}`} className="text-[1.4rem] font-medium">{c.name}</h2>
            <p className="kicker">
              Code <span className="mono ml-1 text-[1rem] tracking-[.25em] text-[var(--accent)]">{c.code}</span>
              {c.starts_on && <> · starts {c.starts_on}</>}
              {me.role === 'admin' && c.facilitator_name && <> · led by {c.facilitator_name}</>}
            </p>
          </div>
          {progress[i].length === 0 ? (
            <p className="mt-3 text-[.95rem] text-[var(--ink-soft)]">Nobody has joined yet. Share the code at your first meal.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-[.9rem]">
                <thead>
                  <tr>
                    <th className="kicker py-2 pr-4 text-left">Person</th>
                    {sessions.map((s) => (
                      <th key={s.n} className="kicker w-8 text-center" title={s.title}>{s.n}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {progress[i].map((m) => (
                    <tr key={m.user_id} className="border-t border-[var(--rule)]">
                      <td className="py-2 pr-4 whitespace-nowrap">{m.name}</td>
                      {sessions.map((s) => (
                        <td key={s.n} className="text-center">
                          {m.done.includes(s.n) ? <span className="text-[var(--ok)]" aria-label={`session ${s.n} done`}>●</span> : <span className="text-[var(--rule)]">·</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <form action={archiveCohortAction.bind(null, c.id, !c.archived)} className="mt-4">
            <button className="kicker cursor-pointer hover:text-[var(--accent)]">{c.archived ? 'Reopen group' : 'Archive group'}</button>
          </form>
        </section>
      ))}
    </div>
  );
}
