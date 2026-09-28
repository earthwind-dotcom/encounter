/**
 * Schema, in order. Append new migrations; never edit one that has shipped.
 * Every statement must be safe to run twice (IF NOT EXISTS, ON CONFLICT DO NOTHING).
 */
export const MIGRATIONS: { id: number; name: string; sql: string }[] = [
  {
    id: 1,
    name: 'accounts and sessions',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id            serial PRIMARY KEY,
        email         text NOT NULL UNIQUE,
        name          text NOT NULL,
        password_hash text NOT NULL,
        role          text NOT NULL DEFAULT 'learner' CHECK (role IN ('learner', 'facilitator', 'admin')),
        lang          text NOT NULL DEFAULT 'en' CHECK (lang IN ('en', 'es', 'pt')),
        created_at    timestamptz NOT NULL DEFAULT now(),
        last_login_at timestamptz
      );
      CREATE TABLE IF NOT EXISTS sessions (
        id         text PRIMARY KEY,
        user_id    integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at timestamptz NOT NULL,
        user_agent text NOT NULL DEFAULT '',
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
    `,
  },
  {
    id: 2,
    name: 'learning progress and private notes',
    sql: `
      -- item_key names a piece of content: 'course:3', 'question:resurrection', 'library:roots/praus'
      CREATE TABLE IF NOT EXISTS progress (
        user_id      integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        item_key     text NOT NULL,
        completed_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (user_id, item_key)
      );
      CREATE TABLE IF NOT EXISTS notes (
        user_id    integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        item_key   text NOT NULL,
        body       text NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (user_id, item_key)
      );
    `,
  },
  {
    id: 3,
    name: 'where are you with Jesus, and requests to talk',
    sql: `
      -- A person's own answer to the course's standing question. Private to them; never a scoreboard.
      CREATE TABLE IF NOT EXISTS journey_stage (
        user_id    integer PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        stage      text NOT NULL CHECK (stage IN ('curious', 'exploring', 'ready', 'following')),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      -- "I'd like to talk to someone." Works signed in or not. Read by admins and facilitators only.
      CREATE TABLE IF NOT EXISTS conversation_requests (
        id          serial PRIMARY KEY,
        user_id     integer REFERENCES users(id) ON DELETE SET NULL,
        name        text NOT NULL,
        contact     text NOT NULL,
        topic       text NOT NULL DEFAULT '',
        message     text NOT NULL,
        lang        text NOT NULL DEFAULT 'en',
        status      text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'replied', 'closed')),
        created_at  timestamptz NOT NULL DEFAULT now()
      );
    `,
  },
  {
    id: 4,
    name: 'cohorts: a facilitated group working through the course together',
    sql: `
      CREATE TABLE IF NOT EXISTS cohorts (
        id             serial PRIMARY KEY,
        name           text NOT NULL,
        code           text NOT NULL UNIQUE,
        facilitator_id integer REFERENCES users(id) ON DELETE SET NULL,
        starts_on      date,
        archived       boolean NOT NULL DEFAULT false,
        created_at     timestamptz NOT NULL DEFAULT now()
      );
      -- Membership shares completion with the group's facilitator. Never notes, never stage.
      CREATE TABLE IF NOT EXISTS cohort_members (
        cohort_id integer NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
        user_id   integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (cohort_id, user_id)
      );
      CREATE INDEX IF NOT EXISTS cohort_members_user_idx ON cohort_members(user_id);
    `,
  },
  {
    id: 5,
    name: 'single-use password reset links, issued by an admin',
    sql: `
      CREATE TABLE IF NOT EXISTS password_resets (
        id         text PRIMARY KEY,
        user_id    integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at timestamptz NOT NULL,
        used_at    timestamptz,
        created_by integer REFERENCES users(id) ON DELETE SET NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `,
  },
];
