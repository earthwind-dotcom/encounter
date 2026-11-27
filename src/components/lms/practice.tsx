'use client';

import { useMemo, useState, useSyncExternalStore, useTransition } from 'react';
import { Check, Flame } from 'lucide-react';
import { logPractice } from '@/app/actions';

/** Today's date on the reader's own calendar, as YYYY-MM-DD. */
const localDay = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const shift = (day: string, by: number) => {
  const d = new Date(`${day}T12:00:00`);
  d.setDate(d.getDate() + by);
  return localDay(d);
};
// The server can't know the reader's "today", so render nothing date-specific until hydrated.
const useToday = () => useSyncExternalStore(() => () => {}, () => localDay(), () => '');

export function streakOf(days: Set<string>, today: string): number {
  // A streak survives until the end of today: count back from today, or from yesterday if today isn't in yet.
  let d = days.has(today) ? today : shift(today, -1);
  let n = 0;
  while (days.has(d)) {
    n++;
    d = shift(d, -1);
  }
  return n;
}

/** "I did it today" on a lesson's practice card, with the last seven days as dots. */
export function PracticeCheckin({ itemKey, days, labels }: { itemKey: string; days: string[]; labels: { did: string; didToday: string; streak: string; week: string } }) {
  const today = useToday();
  const [set, setSet] = useState(() => new Set(days));
  const [pending, start] = useTransition();
  const on = !!today && set.has(today);
  const streak = today ? streakOf(set, today) : 0;
  const week = useMemo(() => (today ? Array.from({ length: 7 }, (_, i) => shift(today, i - 6)) : []), [today]);

  const toggle = () =>
    start(async () => {
      const result = await logPractice(itemKey, today, !on);
      setSet((s) => {
        const n = new Set(s);
        if (result) n.add(today);
        else n.delete(today);
        return n;
      });
    });

  return (
    <div className="relative mt-5 flex flex-wrap items-center gap-4">
      <button type="button" onClick={toggle} disabled={pending || !today} aria-pressed={on} className={on ? 'btn btn-ghost !text-[var(--ok)]' : 'btn'}>
        <Check size={16} /> {on ? labels.didToday : labels.did}
      </button>
      <div className="flex items-center gap-1.5" role="img" aria-label={`${labels.week}: ${week.filter((d) => set.has(d)).length}/7`}>
        {week.map((d) => (
          <span key={d} className={`h-2.5 w-2.5 rounded-full transition-colors ${set.has(d) ? 'bg-[var(--ok)]' : 'bg-[var(--rule-strong)]'} ${d === today ? 'ring-2 ring-[var(--ok-soft)] ring-offset-1 ring-offset-transparent' : ''}`} />
        ))}
      </div>
      {streak > 1 && (
        <span className="pill pill-ok"><Flame size={12} /> {streak} {labels.streak}</span>
      )}
    </div>
  );
}

/** The last four weeks of practice as a grid, for the account page. */
export function PracticeCalendar({ days, labels }: { days: string[]; labels: { title: string; streak: [string, string]; total: [string, string]; empty: string; weekdays: string[] } }) {
  const today = useToday();
  const set = useMemo(() => new Set(days), [days]);
  if (!today) return <div className="h-[132px]" />;
  // 4 full weeks ending this week, Monday first.
  const dow = (new Date(`${today}T12:00:00`).getDay() + 6) % 7;
  const start = shift(today, -dow - 21);
  const cells = Array.from({ length: 28 }, (_, i) => shift(start, i));
  const in28 = cells.filter((d) => set.has(d) && d <= today).length;
  const streak = streakOf(set, today);
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <p className="m-0 text-[2rem] font-medium leading-none">{streak} <span className="sans text-[.84rem] font-normal text-[var(--ink-soft)]">{labels.streak[streak === 1 ? 0 : 1]}</span></p>
        <p className="sans m-0 text-[.84rem] text-[var(--ink-soft)]">{in28} {labels.total[in28 === 1 ? 0 : 1]}</p>
      </div>
      <div className="mt-4 grid max-w-[260px] grid-cols-7 gap-1.5" role="img" aria-label={`${labels.title}: ${in28}`}>
        {labels.weekdays.map((w, i) => (
          <span key={i} aria-hidden="true" className="sans text-center text-[.66rem] font-medium uppercase text-[var(--faint)]">{w}</span>
        ))}
        {cells.map((d) => (
          <span
            key={d}
            aria-hidden="true"
            className={`aspect-square rounded-lg ${d > today ? 'border border-dashed border-[var(--rule)]' : set.has(d) ? 'bg-[var(--ok)]' : 'bg-[var(--glass-inner-2)]'} ${d === today ? 'outline outline-2 outline-offset-1 outline-[var(--accent)]' : ''}`}
          />
        ))}
      </div>
      {in28 === 0 && <p className="sans mt-3 text-[.84rem] text-[var(--faint)]">{labels.empty}</p>}
    </div>
  );
}
