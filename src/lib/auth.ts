import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { Db } from './db';

/**
 * Accounts and sessions, with no third-party auth service.
 *
 * - Passwords: scrypt with a per-user salt, compared in constant time.
 * - Sessions: a random 256-bit token in an httpOnly cookie. The database stores only its
 *   SHA-256, so a leaked database can't be replayed as a login, and sign-out revokes at once.
 * - Roles: `learner` (everyone), `facilitator` (sees facilitator guides and conversation
 *   requests), `admin` (also manages roles).
 */
const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;

export type Role = 'learner' | 'facilitator' | 'admin';
export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  lang: 'en' | 'es' | 'pt';
}

export const SESSION_COOKIE = 'enc_session';
const SESSION_DAYS = 60;
const DAY_MS = 86_400_000;
export const SESSION_MAX_AGE_S = SESSION_DAYS * 86_400;
export const MIN_PASSWORD_LENGTH = 10;

const SCRYPT = { N: 16384, r: 8, p: 1 } as const;
const KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, KEYLEN, SCRYPT);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltB64, hashB64] = stored.split('$');
  if (scheme !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = await scrypt(password, Buffer.from(saltB64, 'base64'), expected.length, SCRYPT);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Checking a password against this when the email doesn't exist keeps response time level,
// so timing can't reveal which emails have accounts.
let dummyHash: Promise<string> | null = null;
const getDummyHash = () => (dummyHash ??= hashPassword(randomBytes(16).toString('hex')));

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export const normalizeEmail = (email: unknown) => (typeof email === 'string' ? email.trim().toLowerCase() : '');

const USER_COLUMNS = 'id, email, name, role, lang';

export async function findUserByEmail(db: Db, email: string): Promise<User | null> {
  const rows = await db.query<User>(`SELECT ${USER_COLUMNS} FROM users WHERE email = $1`, [normalizeEmail(email)]);
  return rows[0] ?? null;
}

/**
 * Who starts as admin. In production, only emails listed in ADMIN_EMAILS (comma-separated),
 * so a stranger can't sign up first on a fresh deploy and take over. Locally, with no list set,
 * the first account is admin for convenience.
 */
async function defaultRole(db: Db, email: string): Promise<Role> {
  const admins = (process.env.ADMIN_EMAILS ?? '').split(',').map(normalizeEmail).filter(Boolean);
  if (admins.includes(normalizeEmail(email))) return 'admin';
  if (admins.length === 0 && process.env.NODE_ENV !== 'production') {
    const [{ n }] = await db.query<{ n: number }>('SELECT count(*)::int AS n FROM users');
    if (n === 0) return 'admin';
  }
  return 'learner';
}

export async function createUser(
  db: Db,
  { email, name, password, lang = 'en', role }: { email: string; name: string; password: string; lang?: User['lang']; role?: Role },
): Promise<User> {
  const rows = await db.query<User>(
    `INSERT INTO users (email, name, password_hash, lang, role) VALUES ($1, $2, $3, $4, $5) RETURNING ${USER_COLUMNS}`,
    [normalizeEmail(email), name.trim(), await hashPassword(password), lang, role ?? (await defaultRole(db, email))],
  );
  return rows[0];
}

export async function authenticate(db: Db, email: string, password: string): Promise<User | null> {
  const rows = await db.query<User & { password_hash: string }>(
    `SELECT ${USER_COLUMNS}, password_hash FROM users WHERE email = $1`,
    [normalizeEmail(email)],
  );
  const row = rows[0];
  const ok = await verifyPassword(password, row?.password_hash ?? (await getDummyHash()));
  if (!row || !ok) return null;
  await db.query('UPDATE users SET last_login_at = now() WHERE id = $1', [row.id]);
  return { id: row.id, email: row.email, name: row.name, role: row.role, lang: row.lang };
}

export async function createSession(db: Db, userId: number, userAgent = ''): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  await db.query('INSERT INTO sessions (id, user_id, expires_at, user_agent) VALUES ($1, $2, $3, $4)', [
    sha256(token),
    userId,
    new Date(Date.now() + SESSION_DAYS * DAY_MS).toISOString(),
    userAgent.slice(0, 200),
  ]);
  return token;
}

/** The user behind a session token, or null. Sliding expiry keeps regular readers signed in. */
export async function getSessionUser(db: Db, token: string | undefined | null): Promise<User | null> {
  if (!token) return null;
  const id = sha256(token);
  const rows = await db.query<User & { expires_at: Date | string }>(
    `SELECT u.id, u.email, u.name, u.role, u.lang, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = $1`,
    [id],
  );
  const row = rows[0];
  if (!row) return null;
  const expires = new Date(row.expires_at).getTime();
  if (expires <= Date.now()) {
    await db.query('DELETE FROM sessions WHERE id = $1', [id]);
    return null;
  }
  if (expires - Date.now() < (SESSION_DAYS / 2) * DAY_MS) {
    await db.query('UPDATE sessions SET expires_at = $1 WHERE id = $2', [
      new Date(Date.now() + SESSION_DAYS * DAY_MS).toISOString(),
      id,
    ]);
  }
  return { id: row.id, email: row.email, name: row.name, role: row.role, lang: row.lang };
}

export async function deleteSession(db: Db, token: string | undefined | null): Promise<void> {
  if (token) await db.query('DELETE FROM sessions WHERE id = $1', [sha256(token)]);
}

export const canFacilitate = (user: Pick<User, 'role'> | null) => user?.role === 'facilitator' || user?.role === 'admin';

/**
 * Brute-force brake: 5 misses per email+IP, or 30 per IP, locks that key for 15 minutes.
 * In memory, which is enough for one server; move to the database if this scales out.
 */
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; first: number }>();
const over = (key: string, limit: number) => {
  const e = attempts.get(key);
  return !!e && Date.now() - e.first <= WINDOW_MS && e.count >= limit;
};
const bump = (key: string) => {
  const e = attempts.get(key);
  if (!e || Date.now() - e.first > WINDOW_MS) attempts.set(key, { count: 1, first: Date.now() });
  else e.count++;
};
export const throttle = {
  isBlocked: (ip: string, key: string) => over(`k:${ip}|${key}`, 5) || over(`ip:${ip}`, 30),
  fail: (ip: string, key: string) => {
    bump(`k:${ip}|${key}`);
    bump(`ip:${ip}`);
  },
  succeed: (ip: string, key: string) => void attempts.delete(`k:${ip}|${key}`),
  reset: () => attempts.clear(),
};
