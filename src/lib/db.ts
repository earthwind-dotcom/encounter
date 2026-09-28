import 'server-only';
import { MIGRATIONS } from './migrations';

/**
 * One tiny query interface over two engines:
 *   - production: real Postgres (Railway), via DATABASE_URL and the `postgres` driver
 *   - local dev and tests: PGlite, an embedded Postgres, so nobody needs a server installed
 *
 * Both speak the same SQL, so there is one set of migrations and no dialect branches.
 * Always pass values as $1, $2 parameters; never interpolate them into the SQL string.
 */
export interface Db {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  /** Several statements at once, no parameters. Migrations only. */
  exec(sql: string): Promise<void>;
}

let dbPromise: Promise<Db> | null = null;

async function connect(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { default: postgres } = await import('postgres');
    const sql = postgres(url, { max: 10, idle_timeout: 30, prepare: false, onnotice: () => {} });
    return {
      query: async <T,>(text: string, params: unknown[] = []) =>
        (await sql.unsafe(text, params as never[])) as unknown as T[],
      exec: async (text: string) => void (await sql.unsafe(text).simple()),
    };
  }
  const { PGlite } = await import('@electric-sql/pglite');
  const dir = process.env.PGLITE_DIR ?? (process.env.NODE_ENV === 'test' ? undefined : '.data/pglite');
  if (dir) (await import('node:fs')).mkdirSync(dir, { recursive: true });
  const pg = new PGlite(dir);
  return {
    query: async <T,>(text: string, params: unknown[] = []) => (await pg.query<T>(text, params)).rows,
    exec: async (text: string) => void (await pg.exec(text)),
  };
}

export async function migrate(db: Db): Promise<void> {
  await db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    id integer PRIMARY KEY, name text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())`);
  const done = new Set((await db.query<{ id: number }>('SELECT id FROM schema_migrations')).map((r) => r.id));
  for (const m of MIGRATIONS) {
    if (done.has(m.id)) continue;
    // Each migration is written to be safe to re-run, so a crash between the two statements is harmless.
    await db.exec(m.sql);
    await db.query('INSERT INTO schema_migrations (id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING', [m.id, m.name]);
  }
}

/** The shared connection, migrated on first use. */
export function getDb(): Promise<Db> {
  if (!dbPromise) {
    dbPromise = connect().then(async (db) => {
      await migrate(db);
      return db;
    });
    dbPromise.catch(() => {
      dbPromise = null;
    });
  }
  return dbPromise;
}

/** Tests only: a fresh in-memory database. */
export async function createTestDb(): Promise<Db> {
  const { PGlite } = await import('@electric-sql/pglite');
  const pg = new PGlite();
  const db: Db = {
    query: async <T,>(text: string, params: unknown[] = []) => (await pg.query<T>(text, params)).rows,
    exec: async (text: string) => void (await pg.exec(text)),
  };
  await migrate(db);
  return db;
}
