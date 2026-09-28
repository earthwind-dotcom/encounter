'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import {
  MIN_PASSWORD_LENGTH,
  SESSION_COOKIE,
  SESSION_MAX_AGE_S,
  authenticate,
  createSession,
  createUser,
  deleteSession,
  findUserByEmail,
  normalizeEmail,
  throttle,
} from '@/lib/auth';
import { getCurrentUser } from '@/lib/session';
import { LANG_COOKIE, isLang } from '@/lib/i18n';

export type FormState = { error?: string; ok?: boolean } | undefined;

const safeNext = (v: FormDataEntryValue | null) => {
  const s = typeof v === 'string' ? v : '';
  return s.startsWith('/') && !s.startsWith('//') ? s : '/account';
};

async function clientIp() {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'local';
}

async function startSession(userId: number) {
  const ua = (await headers()).get('user-agent') ?? '';
  const token = await createSession(await getDb(), userId, ua);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_S,
  });
}

// ---------- language ----------

export async function setLanguage(lang: string) {
  if (!isLang(lang)) return;
  (await cookies()).set(LANG_COOKIE, lang, { path: '/', maxAge: 365 * 86_400, sameSite: 'lax' });
  const user = await getCurrentUser();
  if (user) await (await getDb()).query('UPDATE users SET lang = $1 WHERE id = $2', [lang, user.id]);
  revalidatePath('/', 'layout');
}

// ---------- accounts ----------

const SignUp = z.object({
  name: z.string().trim().min(1, 'Tell us what to call you.').max(80),
  email: z.email('That email address does not look right.'),
  password: z.string().min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters.`).max(200),
  consent: z.literal('on', { error: 'Please agree to how we handle your data.' }),
});

export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  const parsed = SignUp.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const ip = await clientIp();
  if (throttle.isBlocked(ip, 'signup')) return { error: 'Too many attempts. Please wait a few minutes.' };
  const db = await getDb();
  if (await findUserByEmail(db, parsed.data.email)) {
    throttle.fail(ip, 'signup');
    return { error: 'An account with that email already exists. Try signing in.' };
  }
  const lang = (await cookies()).get(LANG_COOKIE)?.value;
  const user = await createUser(db, { ...parsed.data, lang: isLang(lang) ? lang : 'en' });
  await startSession(user.id);
  redirect(safeNext(form.get('next')));
}

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const email = normalizeEmail(form.get('email'));
  const password = String(form.get('password') ?? '');
  const ip = await clientIp();
  if (throttle.isBlocked(ip, email)) return { error: 'Too many attempts. Please wait a few minutes.' };
  const user = await authenticate(await getDb(), email, password);
  if (!user) {
    throttle.fail(ip, email);
    return { error: 'That email and password do not match.' };
  }
  throttle.succeed(ip, email);
  await startSession(user.id);
  redirect(safeNext(form.get('next')));
}

export async function signOut() {
  const jar = await cookies();
  await deleteSession(await getDb(), jar.get(SESSION_COOKIE)?.value);
  jar.delete(SESSION_COOKIE);
  redirect('/');
}

/** Deletes the account and everything attached to it. Conversation requests are unlinked, not kept against the person. */
export async function deleteAccount() {
  const user = await getCurrentUser();
  if (!user) redirect('/');
  const db = await getDb();
  await db.query('DELETE FROM users WHERE id = $1', [user.id]);
  (await cookies()).delete(SESSION_COOKIE);
  redirect('/?deleted=1');
}

// ---------- progress, notes, stage ----------

const ITEM_KEY = /^(course|question|library):[a-z0-9/-]{1,80}$/;

export async function toggleProgress(itemKey: string, done: boolean): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || !ITEM_KEY.test(itemKey)) return false;
  const db = await getDb();
  if (done) {
    await db.query('INSERT INTO progress (user_id, item_key) VALUES ($1, $2) ON CONFLICT DO NOTHING', [user.id, itemKey]);
  } else {
    await db.query('DELETE FROM progress WHERE user_id = $1 AND item_key = $2', [user.id, itemKey]);
  }
  revalidatePath('/account');
  return done;
}

export async function saveNote(itemKey: string, body: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || !ITEM_KEY.test(itemKey)) return false;
  const text = body.slice(0, 20_000);
  const db = await getDb();
  if (text.trim() === '') {
    await db.query('DELETE FROM notes WHERE user_id = $1 AND item_key = $2', [user.id, itemKey]);
  } else {
    await db.query(
      `INSERT INTO notes (user_id, item_key, body) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, item_key) DO UPDATE SET body = EXCLUDED.body, updated_at = now()`,
      [user.id, itemKey, text],
    );
  }
  return true;
}

const STAGES = ['curious', 'exploring', 'ready', 'following'] as const;
export async function setStage(stage: string) {
  const user = await getCurrentUser();
  if (!user || !(STAGES as readonly string[]).includes(stage)) return;
  await (await getDb()).query(
    `INSERT INTO journey_stage (user_id, stage) VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET stage = EXCLUDED.stage, updated_at = now()`,
    [user.id, stage],
  );
  revalidatePath('/account');
}

// ---------- talk to someone ----------

const Talk = z.object({
  name: z.string().trim().min(1, 'Tell us what to call you.').max(80),
  contact: z.string().trim().min(3, 'Leave an email or phone number so someone can reply.').max(160),
  topic: z.string().trim().max(80).optional().default(''),
  message: z.string().trim().min(1, 'Write a sentence or two, whatever you want to say.').max(5000),
  consent: z.literal('on', { error: 'Please agree to how we handle your message.' }),
  website: z.string().max(0).optional(), // honeypot: people leave it empty, bots fill it in
});

export async function requestConversation(_: FormState, form: FormData): Promise<FormState> {
  const parsed = Talk.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const ip = await clientIp();
  if (throttle.isBlocked(ip, 'talk')) return { error: 'Thanks. We have your earlier messages; please give us a little time.' };
  throttle.fail(ip, 'talk'); // counts every request, so one IP can send at most five per 15 minutes
  const user = await getCurrentUser();
  const lang = (await cookies()).get(LANG_COOKIE)?.value;
  await (await getDb()).query(
    'INSERT INTO conversation_requests (user_id, name, contact, topic, message, lang) VALUES ($1, $2, $3, $4, $5, $6)',
    [user?.id ?? null, parsed.data.name, parsed.data.contact, parsed.data.topic, parsed.data.message, isLang(lang) ? lang : 'en'],
  );
  return { ok: true };
}

export async function setRequestStatus(id: number, status: 'new' | 'replied' | 'closed') {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'facilitator' && user.role !== 'admin')) return;
  await (await getDb()).query('UPDATE conversation_requests SET status = $1 WHERE id = $2', [status, id]);
  revalidatePath('/facilitate');
}

export async function setRole(userId: number, role: 'learner' | 'facilitator' | 'admin') {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin' || user.id === userId) return;
  await (await getDb()).query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);
  revalidatePath('/facilitate');
}

// ---------- cohorts ----------

export async function createCohortAction(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'facilitator' && user.role !== 'admin')) return { error: 'Only facilitators can start a group.' };
  const name = String(form.get('name') ?? '').trim();
  if (!name) return { error: 'Give the group a name.' };
  const startsOn = String(form.get('starts_on') ?? '');
  const { createCohort } = await import('@/lib/cohorts');
  await createCohort(await getDb(), name, user.id, /^\d{4}-\d{2}-\d{2}$/.test(startsOn) ? startsOn : null);
  revalidatePath('/facilitate/groups');
  return { ok: true };
}

export async function joinCohortAction(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Sign in first.' };
  const ip = await clientIp();
  if (throttle.isBlocked(ip, 'join')) return { error: 'Too many attempts. Please wait a few minutes.' };
  const { joinCohort } = await import('@/lib/cohorts');
  const cohort = await joinCohort(await getDb(), user.id, String(form.get('code') ?? ''));
  if (!cohort) {
    throttle.fail(ip, 'join');
    return { error: 'That code doesn’t match a group. Check it with your facilitator.' };
  }
  revalidatePath('/account');
  return { ok: true };
}

export async function leaveCohortAction(cohortId: number) {
  const user = await getCurrentUser();
  if (!user) return;
  const { leaveCohort } = await import('@/lib/cohorts');
  await leaveCohort(await getDb(), user.id, cohortId);
  revalidatePath('/account');
}

export async function archiveCohortAction(cohortId: number, archived: boolean) {
  const user = await getCurrentUser();
  if (!user) return;
  const { canManageCohort } = await import('@/lib/cohorts');
  const db = await getDb();
  if (!(await canManageCohort(db, user, cohortId))) return;
  await db.query('UPDATE cohorts SET archived = $1 WHERE id = $2', [archived, cohortId]);
  revalidatePath('/facilitate/groups');
}

// ---------- password reset (admin-issued link) ----------

export async function issueResetLink(userId: number): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') return null;
  const { createPasswordReset } = await import('@/lib/auth');
  const token = await createPasswordReset(await getDb(), userId, user.id);
  return `/reset/${token}`;
}

export async function resetPassword(_: FormState, form: FormData): Promise<FormState> {
  const token = String(form.get('token') ?? '');
  const password = String(form.get('password') ?? '');
  if (password.length < MIN_PASSWORD_LENGTH || password.length > 200) return { error: `Use at least ${MIN_PASSWORD_LENGTH} characters.` };
  const ip = await clientIp();
  if (throttle.isBlocked(ip, 'reset')) return { error: 'Too many attempts. Please wait a few minutes.' };
  const { redeemPasswordReset } = await import('@/lib/auth');
  const userId = await redeemPasswordReset(await getDb(), token, password);
  if (!userId) {
    throttle.fail(ip, 'reset');
    return { error: 'This link has expired or was already used. Ask for a new one.' };
  }
  await startSession(userId);
  redirect('/account');
}
