import type { Metadata } from 'next';
import Link from 'next/link';
import { requireFacilitator } from '@/lib/session';
import { getDb } from '@/lib/db';
import { setRequestStatus, setRole } from '@/app/actions';

export const metadata: Metadata = { title: 'Facilitator desk', robots: { index: false } };

interface Req { id: number; name: string; contact: string; topic: string; message: string; lang: string; status: string; created_at: Date }
interface U { id: number; name: string; email: string; role: string; created_at: Date }

export default async function Facilitate() {
  const me = await requireFacilitator();
  const db = await getDb();
  const [requests, users, [counts]] = await Promise.all([
    db.query<Req>(`SELECT id, name, contact, topic, message, lang, status, created_at FROM conversation_requests
                   ORDER BY (status = 'new') DESC, created_at DESC LIMIT 100`),
    me.role === 'admin' ? db.query<U>('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 200') : Promise.resolve([] as U[]),
    // Aggregate only. Individual stages are private to each person.
    db.query<{ users: number; ready: number; following: number }>(`SELECT
        (SELECT count(*)::int FROM users) AS users,
        (SELECT count(*)::int FROM journey_stage WHERE stage = 'ready') AS ready,
        (SELECT count(*)::int FROM journey_stage WHERE stage = 'following') AS following`),
  ]);
  const fmt = (d: Date) => new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="shell pt-12">
      <p className="kicker kicker-accent">Facilitator desk</p>
      <h1 className="mt-3 text-[2.4rem] font-medium leading-tight">Conversations</h1>
      <p className="mt-2 max-w-2xl text-[var(--ink-soft)]">
        People who asked to talk. Reply personally, from your own address, and mark each one when you have. Count people, not scalps: these
        numbers are for noticing who needs a reply, not for reporting decisions.
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="card px-5 py-3"><span className="kicker">Accounts</span><span className="block text-[1.6rem]">{counts.users}</span></div>
        <div className="card px-5 py-3"><span className="kicker">Say “ready to start”</span><span className="block text-[1.6rem]">{counts.ready}</span></div>
        <div className="card px-5 py-3"><span className="kicker">Say “following”</span><span className="block text-[1.6rem]">{counts.following}</span></div>
 <Link href="/facilitate/groups" className="card px-5 py-3 text-[var(--ink)] hover:border-[var(--accent)]">
          <span className="kicker">Course</span><span className="block">Groups →</span>
        </Link>
        <Link href="/course/gospel-plainly" className="card px-5 py-3 text-[var(--ink)] hover:border-[var(--accent)]">
          <span className="kicker">Guide</span><span className="block">The Gospel, Plainly →</span>
        </Link>
      </div>

      <ul className="mt-10 list-none p-0">
        {requests.length === 0 && <li className="text-[var(--ink-soft)]">No messages yet.</li>}
        {requests.map((r) => (
          <li key={r.id} className={`card mb-4 p-5 ${r.status === 'new' ? 'border-[var(--accent)]' : 'opacity-75'}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium">
                {r.name} <span className="mono text-[.8rem] text-[var(--ink-soft)]">{r.contact}</span>
              </p>
              <p className="kicker">{r.topic || 'general'} · {r.lang} · {fmt(r.created_at)} · {r.status}</p>
            </div>
            <p className="mt-2 whitespace-pre-line text-[.98rem]">{r.message}</p>
            <div className="mt-3 flex gap-2">
              {(['replied', 'closed', 'new'] as const)
                .filter((s) => s !== r.status)
                .map((s) => (
                  <form key={s} action={setRequestStatus.bind(null, r.id, s)}>
                    <button className="btn btn-ghost !py-1.5 !text-[.66rem]">Mark {s}</button>
                  </form>
                ))}
            </div>
          </li>
        ))}
      </ul>

      {me.role === 'admin' && (
        <section className="mt-14">
          <h2 className="text-[1.6rem] font-medium">People and roles</h2>
          <p className="mt-1 text-[.95rem] text-[var(--ink-soft)]">Facilitators can read conversation requests and facilitator guides. They cannot read anyone’s notes.</p>
          <table className="mt-4 w-full border-collapse text-[.95rem]">
            <thead>
              <tr className="kicker text-left"><th className="py-2">Name</th><th>Email</th><th>Role</th><th /></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-[var(--rule)]">
                  <td className="py-2">{u.name}</td>
                  <td className="mono text-[.8rem]">{u.email}</td>
                  <td>{u.role}</td>
                  <td className="text-right">
                    {u.id !== me.id &&
                      (['learner', 'facilitator', 'admin'] as const)
                        .filter((r) => r !== u.role)
                        .map((r) => (
                          <form key={r} action={setRole.bind(null, u.id, r)} className="inline">
                            <button className="kicker ml-3 cursor-pointer hover:text-[var(--accent)]">make {r}</button>
                          </form>
                        ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
