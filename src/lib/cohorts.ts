import { randomInt } from 'node:crypto';
import type { Db } from './db';

/**
 * Cohorts: a group working through the course with a facilitator. A member shares only which
 * sessions they've marked done. Notes and "where are you with Jesus" stay private.
 */
export interface Cohort {
  id: number;
  name: string;
  code: string;
  facilitator_id: number | null;
  facilitator_name?: string | null;
  starts_on: string | null;
  archived: boolean;
}

// No 0/O, 1/I/L: codes are read aloud across a table and typed on phones.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function newCode(): string {
  let s = '';
  for (let i = 0; i < 6; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return s;
}
export const normalizeCode = (v: unknown) => (typeof v === 'string' ? v.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') : '');

export async function createCohort(db: Db, name: string, facilitatorId: number, startsOn: string | null = null): Promise<Cohort> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const rows = await db.query<Cohort>(
      `INSERT INTO cohorts (name, code, facilitator_id, starts_on) VALUES ($1, $2, $3, $4)
       ON CONFLICT (code) DO NOTHING RETURNING id, name, code, facilitator_id, starts_on::text, archived`,
      [name.trim().slice(0, 80), newCode(), facilitatorId, startsOn],
    );
    if (rows[0]) return rows[0];
  }
  throw new Error('could not allocate a cohort code');
}

export async function joinCohort(db: Db, userId: number, code: string): Promise<Cohort | null> {
  const rows = await db.query<Cohort>(
    'SELECT id, name, code, facilitator_id, starts_on::text, archived FROM cohorts WHERE code = $1 AND NOT archived',
    [normalizeCode(code)],
  );
  const cohort = rows[0];
  if (!cohort) return null;
  await db.query('INSERT INTO cohort_members (cohort_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [cohort.id, userId]);
  return cohort;
}

export async function leaveCohort(db: Db, userId: number, cohortId: number): Promise<void> {
  await db.query('DELETE FROM cohort_members WHERE cohort_id = $1 AND user_id = $2', [cohortId, userId]);
}

export async function cohortsForMember(db: Db, userId: number): Promise<Cohort[]> {
  return db.query<Cohort>(
    `SELECT c.id, c.name, c.code, c.facilitator_id, u.name AS facilitator_name, c.starts_on::text, c.archived
       FROM cohort_members m JOIN cohorts c ON c.id = m.cohort_id LEFT JOIN users u ON u.id = c.facilitator_id
      WHERE m.user_id = $1 ORDER BY c.created_at DESC`,
    [userId],
  );
}

/** Admins see every cohort; facilitators see the ones they lead. */
export async function cohortsForFacilitator(db: Db, user: { id: number; role: string }): Promise<Cohort[]> {
  const all = user.role === 'admin';
  return db.query<Cohort>(
    `SELECT c.id, c.name, c.code, c.facilitator_id, u.name AS facilitator_name, c.starts_on::text, c.archived
       FROM cohorts c LEFT JOIN users u ON u.id = c.facilitator_id
      WHERE ($1::boolean OR c.facilitator_id = $2)
      ORDER BY c.archived, c.created_at DESC`,
    [all, user.id],
  );
}

export async function canManageCohort(db: Db, user: { id: number; role: string }, cohortId: number): Promise<boolean> {
  if (user.role === 'admin') return true;
  if (user.role !== 'facilitator') return false;
  const rows = await db.query('SELECT 1 FROM cohorts WHERE id = $1 AND facilitator_id = $2', [cohortId, user.id]);
  return rows.length > 0;
}

export interface MemberProgress {
  user_id: number;
  name: string;
  joined_at: string;
  done: number[];
}

/** Which sessions each member has marked done. Deliberately nothing else. */
export async function cohortProgress(db: Db, cohortId: number): Promise<MemberProgress[]> {
  const rows = await db.query<{ user_id: number; name: string; joined_at: Date; item_key: string | null }>(
    `SELECT m.user_id, u.name, m.joined_at, p.item_key
       FROM cohort_members m JOIN users u ON u.id = m.user_id
       LEFT JOIN progress p ON p.user_id = m.user_id AND p.item_key LIKE 'course:%'
      WHERE m.cohort_id = $1
      ORDER BY u.name`,
    [cohortId],
  );
  const byUser = new Map<number, MemberProgress>();
  for (const r of rows) {
    const m = byUser.get(r.user_id) ?? { user_id: r.user_id, name: r.name, joined_at: new Date(r.joined_at).toISOString(), done: [] };
    if (r.item_key) m.done.push(Number(r.item_key.slice('course:'.length)));
    byUser.set(r.user_id, m);
  }
  return [...byUser.values()];
}
