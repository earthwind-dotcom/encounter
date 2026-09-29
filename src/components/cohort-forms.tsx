'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createCohortAction, joinCohortAction, type FormState } from '@/app/actions';
import { pick, type Lang } from '@/lib/i18n';

export function CreateCohortForm({ lang }: { lang: Lang }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createCohortAction, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="card grid gap-3 p-5 sm:grid-cols-[1fr_auto_auto] sm:items-end">
      <label className="field !mb-0"><span>{pick({ en: 'Group name', es: 'Nombre del grupo', pt: 'Nome do grupo' }, lang)}</span><input className="input" name="name" placeholder={pick({ en: 'Faith Chapel, spring cohort', es: 'Faith Chapel, grupo de primavera', pt: 'Faith Chapel, turma de primavera' }, lang)} required maxLength={80} /></label>
      <label className="field !mb-0"><span>{pick({ en: 'Starts (optional)', es: 'Empieza (opcional)', pt: 'Começa (opcional)' }, lang)}</span><input className="input" name="starts_on" type="date" /></label>
      <button className="btn" disabled={pending}>{pick({ en: 'Start a group', es: 'Crear un grupo', pt: 'Criar um grupo' }, lang)}</button>
      {state?.error && <p className="error sm:col-span-3" role="alert">{state.error}</p>}
    </form>
  );
}

export function JoinCohortForm({ lang }: { lang: Lang }) {
  const [state, action, pending] = useActionState<FormState, FormData>(joinCohortAction, undefined);
  return (
    <form action={action} className="mt-3 flex flex-wrap items-end gap-3">
      <label className="field !mb-0">
        <span>{pick({ en: 'Group code', es: 'Código del grupo', pt: 'Código do grupo' }, lang)}</span>
        <input className="input mono !w-40 uppercase tracking-[.2em]" name="code" required maxLength={12} autoComplete="off" />
      </label>
      <button className="btn btn-ghost" disabled={pending}>{pick({ en: 'Join', es: 'Unirme', pt: 'Entrar' }, lang)}</button>
      {state?.error && <p className="error w-full" role="alert">{state.error}</p>}
      {state?.ok && <p className="w-full text-[.95rem] text-[var(--ok)]" role="status">{pick({ en: 'You’re in.', es: 'Ya estás dentro.', pt: 'Você está dentro.' }, lang)}</p>}
    </form>
  );
}
