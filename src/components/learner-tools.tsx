'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Bookmark, Check, CheckCircle2, Circle, LogIn, NotebookPen, Save } from 'lucide-react';
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
      <div className="glass no-print flex flex-wrap items-center gap-4 p-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><Bookmark size={18} /></span>
        <p className="sans m-0 min-w-0 flex-1 text-[.92rem] text-[var(--ink-soft)]">{labels.signInToTrack}</p>
        <Link href={`/signin?next=${encodeURIComponent(returnTo)}`} className="btn btn-ghost btn-sm">
          <LogIn size={14} /> {labels.markDone}
        </Link>
      </div>
    );
  }

  return (
    <section className="glass no-print p-5 sm:p-6" aria-label={labels.yourNotes}>
      {notes && (
        <label className="field">
          <span className="!flex items-center gap-2"><NotebookPen size={14} /> {labels.yourNotes}</span>
          <textarea className="input" value={note} onChange={(e) => setNote(e.target.value)} maxLength={20000} />
          <em className="sans mt-2 block text-[.8rem] not-italic text-[var(--faint)]">{labels.notesHint}</em>
        </label>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={done ? 'btn btn-ghost !text-[var(--ok)]' : 'btn'}
          aria-pressed={done}
          disabled={pending}
          onClick={() => start(async () => setDone(await toggleProgress(itemKey, !done)))}
        >
          {done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
          {done ? labels.done : labels.markDone}
        </button>
        {notes && (
          <button
            type="button"
            className="btn btn-ghost"
            disabled={pending || note === savedNote}
            onClick={() => start(async () => void ((await saveNote(itemKey, note)) && setSavedNote(note)))}
          >
            {note === savedNote && note ? <Check size={15} /> : <Save size={15} />}
            {note === savedNote && note ? labels.saved : labels.save}
          </button>
        )}
      </div>
    </section>
  );
}
