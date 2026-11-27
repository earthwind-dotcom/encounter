import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDb } from './db';
import { SESSION_COOKIE, canFacilitate, getSessionUser, type User } from './auth';

/** Server Components' view of the session. Cached per request. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getSessionUser(await getDb(), token);
});

export async function requireUser(next = '/account'): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent(next)}`);
  return user;
}

/**
 * The course, the full answers and the library are for members. A visitor without an account is
 * sent to sign up (with a link to sign in), and comes back to the page they asked for.
 */
export async function requireMember(next: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/signup?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireFacilitator(): Promise<User> {
  const user = await requireUser('/facilitate');
  if (!canFacilitate(user)) redirect('/account');
  return user;
}
