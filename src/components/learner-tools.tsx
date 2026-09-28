'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { saveNote, toggleProgress } from '@/app/actions';

interface Labels {
  markDone: string;
  done: string;
  signInToTrack: string;
  yourNotes: string;
  notesHint: string;
  save: string;
  saved: string;
}

/**
 * Progress and private notes for one piece of content. Signed-out readers see a quiet
 * invitation to sign in; the content itself never sits behind an account.
 */
export function LearnerTools({
  itemKey,
  signedIn,
  initialDone,
  initialNote,
  labels,
  notes = true,
  returnTo,
}: {
  itemKey: string;
  signedIn: boolean;
  initialDone: boolean;
  initialNote: string;
  labels: Labels;
  notes?: boolean;
  returnTo: string;
}) {
  const [done, setDone] = useState(initialDone);
  const [note, setNote] = useState(initialNote);
  const [savedNote, setSavedNote] = useState(initialNote);
  const [pending, start] = useTransition();

  if (!signedIn) {
    return (
      <div className="card no-print mt-12 p-5 text-[.95rem] text-[var(--ink-soft)]">
        <Link href={`/signin?next=${encodeURIComponent(returnTo)}`}>{labels.signInToTrack}</Link>
      </div>
    );
  }

  return (
    <section className="card no-print mt-12 p-5" aria-label={labels.yourNotes}>
      {notes && (
        <label className="field">
          <span>{labels.yourNotes}</span>
          <textarea className="input" value={note} onChange={(e) => setNote(e.target.value)} maxLength={20000} />
          <em className="mt-1 block text-[.85rem] text-[var(--faint)]">{labels.notesHint}</em>
        </label>
      )}
      <div className="flex flex-wrap items-center gap-3">
        {notes && (
          <button
            type="button"
            className="btn btn-ghost"
            disabled={pending || note === savedNote}
            onClick={() => start(async () => void ((await saveNote(itemKey, note)) && setSavedNote(note)))}
          >
            {note === savedNote && note ? labels.saved : labels.save}
          </button>
        )}
        <button
          type="button"
          className={done ? 'btn btn-ghost' : 'btn'}
          aria-pressed={done}
          disabled={pending}
          onClick={() => start(async () => setDone(await toggleProgress(itemKey, !done)))}
        >
          {done ? `✓ ${labels.done}` : labels.markDone}
        </button>
      </div>
    </section>
  );
}
