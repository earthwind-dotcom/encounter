'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createCohortAction, joinCohortAction, type FormState } from '@/app/actions';

export function CreateCohortForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createCohortAction, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="card grid gap-3 p-5 sm:grid-cols-[1fr_auto_auto] sm:items-end">
      <label className="field !mb-0"><span>Group name</span><input className="input" name="name" placeholder="Faith Chapel, spring cohort" required maxLength={80} /></label>
      <label className="field !mb-0"><span>Starts (optional)</span><input className="input" name="starts_on" type="date" /></label>
      <button className="btn" disabled={pending}>Start a group</button>
      {state?.error && <p className="error sm:col-span-3" role="alert">{state.error}</p>}
    </form>
  );
}

export function JoinCohortForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(joinCohortAction, undefined);
  return (
    <form action={action} className="mt-3 flex flex-wrap items-end gap-3">
      <label className="field !mb-0">
        <span>Group code</span>
        <input className="input mono !w-40 uppercase tracking-[.2em]" name="code" required maxLength={12} autoComplete="off" />
      </label>
      <button className="btn btn-ghost" disabled={pending}>Join</button>
      {state?.error && <p className="error w-full" role="alert">{state.error}</p>}
      {state?.ok && <p className="w-full text-[.95rem] text-[var(--ok)]" role="status">You’re in.</p>}
    </form>
  );
}
