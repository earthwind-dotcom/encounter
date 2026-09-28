# Working on Encounter

For anyone joining, and for their coding agents. Read this, then `docs/ROADMAP.md` and
`docs/EDITORIAL.md`.

## Setup

```
git clone https://github.com/earthwind-dotcom/encounter.git
cd encounter
npm install
npm run dev     # http://localhost:3000
```

No database to install: locally the app uses PGlite, an embedded Postgres, stored in `.data/`
(ignored by git). Delete `.data/` to start fresh. The first account you create locally is admin.

## How we work

- **Branch, then pull request.** Don't push to `main` directly; `main` deploys to production on
  Railway automatically. Name branches `yourname/short-topic`.
- **Keep PRs small** and say what changed and why.
- **Before pushing:** `npm test && npm run lint && npm run typecheck && npm run build`. CI runs
  the same.
- **Content changes are PRs too.** A second person reads every new Hard Question or session
  before it's marked reviewed.
- **Two people, two agents.** If you and someone else are both working, pull `main` before you
  start, work on your own branch, and rebase before opening the PR. Avoid both editing the same
  content file at once; say in the PR description which files you're taking.

## Where things are

```
content/            everything published (Markdown + JSON)
  questions/        Hard Questions; <slug>.es.md for Spanish
  course/           the 13 sessions; participant and facilitator parts
  library.json      the imported Marginalia articles
src/app/            routes (Next.js 16 App Router)
src/lib/            db, auth, content loading, i18n
src/components/     UI
scripts/            importers (legacy site, vault)
tests/              vitest
legacy/             the original Marginalia site and its tooling, frozen
docs/               roadmap and editorial rules
```

## Next.js 16

This is Next.js 16, which differs from older versions: `params` and `cookies()` are async,
`middleware` is now `proxy`, Turbopack is the default. The bundled docs are in
`node_modules/next/dist/docs/`. Check them before writing framework code.

## Adding a Hard Question

1. Copy an existing file in `content/questions/`. Keep the frontmatter keys.
2. Follow `docs/EDITORIAL.md`: plain voice, no em dashes, five labels only, real sources only,
   end with `## Where this leaves you`.
3. `npm test` checks labels, em dashes, the open-door ending, and that every link resolves.
4. Leave `reviewed` unset. The reviewer sets `reviewed: true`.

## Adding a database change

Append a migration to `src/lib/migrations.ts`. Never edit one that has shipped. Make every
statement safe to run twice (`IF NOT EXISTS`). Add a test in `tests/`.
