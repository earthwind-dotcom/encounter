'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { requestConversation, signIn, signUp, type FormState } from '@/app/actions';

export function SignInForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(signIn, undefined);
  return (
    <form action={action} className="mt-8">
      <input type="hidden" name="next" value={next} />
      <label className="field"><span>Email</span><input className="input" name="email" type="email" autoComplete="email" required /></label>
      <label className="field"><span>Password</span><input className="input" name="password" type="password" autoComplete="current-password" required /></label>
      {state?.error && <p className="error" role="alert">{state.error}</p>}
      <button className="btn mt-2" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
      <p className="mt-6 text-[.95rem] text-[var(--ink-soft)]">
        New here? <Link href={`/signup?next=${encodeURIComponent(next)}`}>Create an account</Link>. You don’t need one to read anything.
      </p>
    </form>
  );
}

export function SignUpForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(signUp, undefined);
  return (
    <form action={action} className="mt-8">
      <input type="hidden" name="next" value={next} />
      <label className="field"><span>What should we call you?</span><input className="input" name="name" autoComplete="given-name" required maxLength={80} /></label>
      <label className="field"><span>Email</span><input className="input" name="email" type="email" autoComplete="email" required /></label>
      <label className="field"><span>Password (10+ characters)</span><input className="input" name="password" type="password" autoComplete="new-password" minLength={10} required /></label>
      <label className="mb-4 flex gap-3 text-[.95rem] leading-snug text-[var(--ink-soft)]">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span>
          I agree to how Encounter handles my data, as set out in the <Link href="/privacy">privacy notice</Link>. Your notes are private to you.
        </span>
      </label>
      {state?.error && <p className="error" role="alert">{state.error}</p>}
      <button className="btn mt-2" disabled={pending}>{pending ? 'Creating…' : 'Create account'}</button>
      <p className="mt-6 text-[.95rem] text-[var(--ink-soft)]">
        Already have one? <Link href={`/signin?next=${encodeURIComponent(next)}`}>Sign in</Link>.
      </p>
    </form>
  );
}

export function TalkForm({ defaultName = '', defaultContact = '' }: { defaultName?: string; defaultContact?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(requestConversation, undefined);
  if (state?.ok) {
    return (
      <div className="card mt-8 p-6" role="status">
        <p className="text-[1.15rem]">Thank you. A real person will read this and get back to you.</p>
        <p className="mt-2 text-[.95rem] text-[var(--ink-soft)]">
          If you’re in danger or thinking about ending your life, please don’t wait for us: call or text your local emergency number, or 988 in
          the United States.
        </p>
      </div>
    );
  }
  return (
    <form action={action} className="mt-8">
      <label className="field"><span>Your name (or what we should call you)</span><input className="input" name="name" defaultValue={defaultName} required maxLength={80} /></label>
      <label className="field"><span>Email or phone, so we can reply</span><input className="input" name="contact" defaultValue={defaultContact} required maxLength={160} /></label>
      <label className="field">
        <span>What’s it about? (optional)</span>
        <select className="input" name="topic" defaultValue="">
          <option value="">Just want to talk</option>
          <option value="question">A question I can’t get past</option>
          <option value="follow">I think I want to follow Jesus</option>
          <option value="church">Finding a church or a group</option>
          <option value="hurt">Something painful</option>
          <option value="course">Joining or running the course</option>
        </select>
      </label>
      <label className="field"><span>Your message</span><textarea className="input" name="message" required maxLength={5000} /></label>
      <label className="hidden" aria-hidden="true">Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <label className="mb-4 flex gap-3 text-[.95rem] leading-snug text-[var(--ink-soft)]">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span>I agree that Encounter can store this message to reply to me, as set out in the <Link href="/privacy">privacy notice</Link>.</span>
      </label>
      {state?.error && <p className="error" role="alert">{state.error}</p>}
      <button className="btn" disabled={pending}>{pending ? 'Sending…' : 'Send'}</button>
    </form>
  );
}
