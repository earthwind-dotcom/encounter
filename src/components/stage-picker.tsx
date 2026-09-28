'use client';

import { useState, useTransition } from 'react';
import { setStage } from '@/app/actions';

const OPTIONS = [
  { id: 'curious', label: 'Curious', hint: 'I’m looking into this. No commitments.' },
  { id: 'exploring', label: 'Exploring', hint: 'I’m taking Jesus seriously and working through my questions.' },
  { id: 'ready', label: 'Ready to start', hint: 'I think I want to follow Jesus.' },
  { id: 'following', label: 'Following', hint: 'I’ve started following him.' },
] as const;

/** The course's standing question, answered privately. Every answer is a fine answer. */
export function StagePicker({ initial }: { initial: string | null }) {
  const [stage, set] = useState(initial);
  const [pending, start] = useTransition();
  return (
    <fieldset className="mt-4 grid gap-2 sm:grid-cols-2" disabled={pending}>
      <legend className="sr-only">Where are you with following Jesus?</legend>
      {OPTIONS.map((o) => (
        <label
          key={o.id}
          className={`card cursor-pointer p-4 ${stage === o.id ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : ''}`}
        >
          <input
            type="radio"
            name="stage"
            value={o.id}
            checked={stage === o.id}
            onChange={() => start(async () => { set(o.id); await setStage(o.id); })}
            className="sr-only"
          />
          <span className="block font-medium">{o.label}</span>
          <span className="block text-[.9rem] text-[var(--ink-soft)]">{o.hint}</span>
        </label>
      ))}
    </fieldset>
  );
}
