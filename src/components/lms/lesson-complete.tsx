'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Circle, LogIn, PartyPopper } from 'lucide-react';
import { toggleProgress } from '@/app/actions';

interface Neighbor {
  href: string;
  title: string;
  label: string;
}

interface Labels {
  complete: string;
  completeContinue: string;
  completed: string;
  undo: string;
  signInToTrack: string;
  endOf: string;
  finished: string;
  finishedHint: string;
  next: string;
  prev: string;
}

/**
 * The end of a lesson: mark it complete and move on in one press. On phones the same actions
 * also ride in a bar fixed to the bottom of the screen, so they're never a scroll away.
 */
export function LessonComplete({
  itemKey,
  signedIn,
  initialDone,
  prev,
  next,
  lessonLabel,
  finishHref,
  returnTo,
  labels,
}: {
  itemKey: string;
  signedIn: boolean;
  initialDone: boolean;
  prev?: Neighbor;
  next?: Neighbor;
  lessonLabel: string;
  finishHref: string;
  returnTo: string;
  labels: Labels;
}) {
  const [done, setDone] = useState(initialDone);
  const [pending, start] = useTransition();
  const router = useRouter();
  const signInHref = `/signin?next=${encodeURIComponent(returnTo)}`;

  const completeAndGo = () =>
    start(async () => {
      if (!done) setDone(await toggleProgress(itemKey, true));
      router.push(next?.href ?? finishHref);
    });
  const toggle = () => start(async () => setDone(await toggleProgress(itemKey, !done)));

  return (
    <>
      <section className="glass-strong no-print relative overflow-hidden !rounded-[26px] p-6 sm:p-8" aria-label={labels.endOf}>
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,var(--accent-glow),transparent)] blur-2xl" />
        <div className="relative flex flex-wrap items-center gap-5">
          <span
            className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl transition-colors duration-500 ${
              done ? 'bg-[var(--ok)] text-[var(--paper)]' : 'bg-[var(--accent-soft)] text-[var(--accent)]'
            }`}
          >
            {done ? (next ? <Check size={24} /> : <PartyPopper size={24} />) : <Circle size={22} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="kicker">{labels.endOf} · {lessonLabel}</p>
            <p className="mt-1 text-[1.25rem] font-medium leading-snug">
              {done ? (next ? labels.completed : labels.finished) : next ? `${labels.next}: ${next.title}` : labels.finishedHint}
            </p>
          </div>
          <div className="flex w-full flex-wrap gap-3 sm:w-auto">
            {signedIn ? (
              <>
                {done && (
                  <button type="button" className="btn btn-ghost" onClick={toggle} disabled={pending}>
                    <CheckCircle2 size={16} className="text-[var(--ok)]" /> {labels.undo}
                  </button>
                )}
                <button type="button" className="btn flex-1 sm:flex-none" onClick={completeAndGo} disabled={pending}>
                  {done ? labels.next : labels.completeContinue} <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <>
                <Link href={signInHref} className="btn btn-ghost"><LogIn size={15} /> {labels.signInToTrack}</Link>
                {next && <Link href={next.href} className="btn">{labels.next} <ArrowRight size={16} /></Link>}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Phone bar */}
      <div className="no-print fixed inset-x-3 bottom-3 z-40 lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="glass-strong flex items-center gap-2 !rounded-full p-1.5 shadow-[var(--shadow-lift)]">
          {prev ? (
            <Link href={prev.href} aria-label={`${labels.prev}: ${prev.title}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-[var(--ink)] hover:bg-[var(--glass-inner-hover)]">
              <ArrowLeft size={18} />
            </Link>
          ) : <span className="h-11 w-11" />}
          {signedIn ? (
            <button
              type="button"
              aria-pressed={done}
              onClick={toggle}
              disabled={pending}
              className={`sans flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-[.86rem] font-medium transition-colors ${
                done ? 'bg-[var(--ok-soft)] text-[var(--ok)]' : 'bg-[var(--accent)] text-[var(--on-accent)]'
              }`}
            >
              {done ? <CheckCircle2 size={16} /> : <Circle size={16} />} {done ? labels.completed : labels.complete}
            </button>
          ) : (
            <Link href={signInHref} className="sans flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-[.84rem] font-medium text-[var(--ink-soft)]">
              <LogIn size={15} /> {labels.signInToTrack}
            </Link>
          )}
          {next ? (
            <Link href={next.href} aria-label={`${labels.next}: ${next.title}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-[var(--ink)] hover:bg-[var(--glass-inner-hover)]">
              <ArrowRight size={18} />
            </Link>
          ) : <span className="h-11 w-11" />}
        </div>
      </div>
    </>
  );
}
