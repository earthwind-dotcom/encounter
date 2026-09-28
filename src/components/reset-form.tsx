'use client';

import { useActionState, useState, useTransition } from 'react';
import { issueResetLink, resetPassword, type FormState } from '@/app/actions';

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(resetPassword, undefined);
  return (
    <form action={action} className="mt-8">
      <input type="hidden" name="token" value={token} />
      <label className="field">
        <span>New password (10+ characters)</span>
        <input className="input" name="password" type="password" autoComplete="new-password" minLength={10} required />
      </label>
      {state?.error && <p className="error" role="alert">{state.error}</p>}
      <button className="btn" disabled={pending}>Save and sign in</button>
    </form>
  );
}

/** Admin tool: make a one-time reset link to pass to someone personally. */
export function ResetLinkButton({ userId }: { userId: number }) {
  const [link, setLink] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (link) {
    const full = `${window.location.origin}${link}`;
    return (
      <span className="inline-flex items-center gap-2">
        <input readOnly value={full} className="input mono !w-64 !py-1 !text-[.7rem]" onFocus={(e) => e.target.select()} aria-label="Reset link" />
        <button type="button" className="kicker cursor-pointer hover:text-[var(--accent)]" onClick={() => navigator.clipboard?.writeText(full)}>
          copy
        </button>
      </span>
    );
  }
  return (
    <button
      type="button"
      disabled={pending}
      className="kicker ml-3 cursor-pointer hover:text-[var(--accent)]"
      onClick={() => start(async () => setLink(await issueResetLink(userId)))}
    >
      reset link
    </button>
  );
}
