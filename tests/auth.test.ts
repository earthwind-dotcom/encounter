import { beforeEach, describe, expect, it } from 'vitest';
import { createTestDb, migrate, type Db } from '@/lib/db';
import {
  authenticate,
  createSession,
  createUser,
  deleteSession,
  getSessionUser,
  hashPassword,
  throttle,
  verifyPassword,
} from '@/lib/auth';

let db: Db;
beforeEach(async () => {
  db = await createTestDb();
  throttle.reset();
});

describe('passwords', () => {
  it('verifies the right password and rejects others', async () => {
    const h = await hashPassword('correct horse battery');
    expect(await verifyPassword('correct horse battery', h)).toBe(true);
    expect(await verifyPassword('wrong', h)).toBe(false);
    expect(await verifyPassword('x', 'garbage')).toBe(false);
  });
  it('salts every hash', async () => {
    expect(await hashPassword('same')).not.toBe(await hashPassword('same'));
  });
});

describe('accounts', () => {
  it('makes the first account admin and later ones learners', async () => {
    const a = await createUser(db, { email: 'First@Example.org', name: 'A', password: 'long enough pw' });
    const b = await createUser(db, { email: 'b@example.org', name: 'B', password: 'long enough pw' });
    expect(a.role).toBe('admin');
    expect(a.email).toBe('first@example.org');
    expect(b.role).toBe('learner');
  });
  it('authenticates case-insensitively and never returns the hash', async () => {
    await createUser(db, { email: 'x@example.org', name: 'X', password: 'long enough pw' });
    const u = await authenticate(db, ' X@Example.org ', 'long enough pw');
    expect(u?.email).toBe('x@example.org');
    expect(u && 'password_hash' in u).toBe(false);
    expect(await authenticate(db, 'x@example.org', 'nope')).toBeNull();
    expect(await authenticate(db, 'nobody@example.org', 'long enough pw')).toBeNull();
  });
  it('in production, makes admin only the emails in ADMIN_EMAILS', async () => {
    const env = process.env as Record<string, string | undefined>;
    const prev = { node: env.NODE_ENV, admins: env.ADMIN_EMAILS };
    env.NODE_ENV = 'production';
    try {
      env.ADMIN_EMAILS = '';
      const first = await createUser(db, { email: 'stranger@example.org', name: 'S', password: 'long enough pw' });
      expect(first.role).toBe('learner');
      env.ADMIN_EMAILS = 'Owner@Example.org, other@example.org';
      const owner = await createUser(db, { email: 'owner@example.org', name: 'O', password: 'long enough pw' });
      expect(owner.role).toBe('admin');
    } finally {
      env.NODE_ENV = prev.node;
      env.ADMIN_EMAILS = prev.admins;
    }
  });
  it('rejects a duplicate email', async () => {
    await createUser(db, { email: 'd@example.org', name: 'D', password: 'long enough pw' });
    await expect(createUser(db, { email: 'D@example.org', name: 'D2', password: 'long enough pw' })).rejects.toThrow();
  });
});

describe('sessions', () => {
  it('stores only a hash of the token and revokes on sign-out', async () => {
    const u = await createUser(db, { email: 's@example.org', name: 'S', password: 'long enough pw' });
    const token = await createSession(db, u.id, 'test');
    const rows = await db.query<{ id: string }>('SELECT id FROM sessions');
    expect(rows[0].id).not.toBe(token);
    expect((await getSessionUser(db, token))?.id).toBe(u.id);
    await deleteSession(db, token);
    expect(await getSessionUser(db, token)).toBeNull();
  });
  it('drops expired sessions', async () => {
    const u = await createUser(db, { email: 'e@example.org', name: 'E', password: 'long enough pw' });
    const token = await createSession(db, u.id);
    await db.query("UPDATE sessions SET expires_at = now() - interval '1 day'");
    expect(await getSessionUser(db, token)).toBeNull();
    expect(await db.query('SELECT 1 FROM sessions')).toHaveLength(0);
  });
  it('deleting a user removes their sessions, progress and notes', async () => {
    const u = await createUser(db, { email: 'g@example.org', name: 'G', password: 'long enough pw' });
    await createSession(db, u.id);
    await db.query("INSERT INTO progress (user_id, item_key) VALUES ($1, 'course:1')", [u.id]);
    await db.query("INSERT INTO notes (user_id, item_key, body) VALUES ($1, 'course:1', 'private')", [u.id]);
    await db.query('DELETE FROM users WHERE id = $1', [u.id]);
    for (const t of ['sessions', 'progress', 'notes']) expect(await db.query(`SELECT 1 FROM ${t}`)).toHaveLength(0);
  });
});

describe('throttle', () => {
  it('locks a key after five failures', () => {
    for (let i = 0; i < 5; i++) throttle.fail('1.1.1.1', 'k');
    expect(throttle.isBlocked('1.1.1.1', 'k')).toBe(true);
    expect(throttle.isBlocked('2.2.2.2', 'k')).toBe(false);
  });
});

describe('migrations', () => {
  it('are safe to run twice', async () => {
    await migrate(db);
    const rows = await db.query<{ id: number }>('SELECT id FROM schema_migrations ORDER BY id');
    expect(rows.map((r) => r.id)).toEqual([1, 2, 3, 4]);
  });
});

describe('cohorts', () => {
  it('lets a learner join by code and shows the facilitator completion only', async () => {
    const { createCohort, joinCohort, cohortProgress, canManageCohort, normalizeCode } = await import('@/lib/cohorts');
    const fac = await createUser(db, { email: 'f@example.org', name: 'Fac', password: 'long enough pw', role: 'facilitator' });
    const other = await createUser(db, { email: 'o@example.org', name: 'Other', password: 'long enough pw', role: 'facilitator' });
    const learner = await createUser(db, { email: 'l@example.org', name: 'Learner', password: 'long enough pw' });
    const c = await createCohort(db, 'Spring', fac.id);
    expect(c.code).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
    expect(await joinCohort(db, learner.id, 'nope')).toBeNull();
    expect((await joinCohort(db, learner.id, ` ${c.code.toLowerCase()} `))?.id).toBe(c.id);
    await db.query("INSERT INTO progress (user_id, item_key) VALUES ($1, 'course:3'), ($1, 'question:hell')", [learner.id]);
    await db.query("INSERT INTO notes (user_id, item_key, body) VALUES ($1, 'course:3', 'secret')", [learner.id]);
    const p = await cohortProgress(db, c.id);
    expect(p).toEqual([expect.objectContaining({ name: 'Learner', done: [3] })]);
    expect(JSON.stringify(p)).not.toContain('secret');
    expect(await canManageCohort(db, fac, c.id)).toBe(true);
    expect(await canManageCohort(db, other, c.id)).toBe(false);
    expect(await canManageCohort(db, learner, c.id)).toBe(false);
    expect(normalizeCode('ab-c 12')).toBe('ABC12');
  });
  it('refuses to join an archived group', async () => {
    const { createCohort, joinCohort } = await import('@/lib/cohorts');
    const fac = await createUser(db, { email: 'f2@example.org', name: 'Fac', password: 'long enough pw', role: 'facilitator' });
    const c = await createCohort(db, 'Old', fac.id);
    await db.query('UPDATE cohorts SET archived = true WHERE id = $1', [c.id]);
    expect(await joinCohort(db, fac.id, c.code)).toBeNull();
  });
});
