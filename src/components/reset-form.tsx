'use client';

import { useActionState, useState, useTransition } from 'react';
import { issueResetLink, resetPassword, type FormState } from '@/app/actions';
import { pick, type Lang } from '@/lib/i18n';

export function ResetForm({ token, lang }: { token: string; lang: Lang }) {
  const [state, action, pending] = useActionState<FormState, FormData>(resetPassword, undefined);
  return (
    <form action={action} className="mt-8">
      <input type="hidden" name="token" value={token} />
      <label className="field">
        <span>{pick({ en: 'New password (10+ characters)', es: 'Contraseña nueva (10 caracteres o más)', pt: 'Senha nova (10 caracteres ou mais)' }, lang)}</span>
        <input className="input" name="password" type="password" autoComplete="new-password" minLength={10} required />
      </label>
      {state?.error && <p className="error" role="alert">{state.error}</p>}
      <button className="btn" disabled={pending}>{pick({ en: 'Save and sign in', es: 'Guardar y entrar', pt: 'Salvar e entrar' }, lang)}</button>
    </form>
  );
}

/** Admin tool: make a one-time reset link to pass to someone personally. */
export function ResetLinkButton({ userId, lang }: { userId: number; lang: Lang }) {
  const [link, setLink] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (link) {
    const full = `${window.location.origin}${link}`;
    return (
      <span className="inline-flex items-center gap-2">
        <input readOnly value={full} className="input mono !w-64 !py-1 !text-[.7rem]" onFocus={(e) => e.target.select()} aria-label={pick({ en: 'Reset link', es: 'Enlace para restablecer', pt: 'Link de redefinição' }, lang)} />
        <button type="button" className="kicker cursor-pointer hover:text-[var(--accent)]" onClick={() => navigator.clipboard?.writeText(full)}>
          {pick({ en: 'copy', es: 'copiar', pt: 'copiar' }, lang)}
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
      {pick({ en: 'reset link', es: 'enlace de contraseña', pt: 'link de senha' }, lang)}
    </button>
  );
}
