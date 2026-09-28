# Encounter

An honest, research-grounded path to meeting Jesus and reading the Bible well. Plain
language, hard questions welcome, a clear invitation, and real freedom to say no.

Formerly **Marginalia**. Everything Marginalia published lives on in the Library, and the
original single-file site is kept in [`legacy/`](legacy/).

- **Game plan:** [docs/ROADMAP.md](docs/ROADMAP.md)
- **Editorial rules** (voice, confidence labels, sources): [docs/EDITORIAL.md](docs/EDITORIAL.md)
- **Working on this repo** (for collaborators and their agents): [CONTRIBUTING.md](CONTRIBUTING.md)

## What's in it

| Area | Route | Source |
|---|---|---|
| Hard Questions | `/questions` | `content/questions/*.md` (written for Encounter) |
| The Course (13 sessions) | `/course`, `/course/<n>` | `content/course/session-NN.md` (imported from the vault) |
| The pathway (4 stages) | `/course/pathway/<slug>` | `content/library.json` (from Marginalia) |
| Library: Reflections, Roots, Provenance | `/library/...` | `content/library.json` (from Marginalia) |
| About | `/about/<slug>` | `content/library.json` (Marginalia's Colophon) |
| Accounts, progress, notes | `/account` | Postgres |
| Talk to someone | `/talk` → `/facilitate` | Postgres |

Everything is readable without an account. An account adds progress, private notes, and a
private answer to "where are you with following Jesus?". In production, accounts whose email
is listed in the `ADMIN_EMAILS` variable become **admin**; admins make others facilitators from
`/facilitate`. Locally, with no list set, the first account is admin.

## Run it

```
npm install
npm run dev          # http://localhost:3000, with an embedded Postgres in .data/ (no setup)
npm test             # auth + content rules
npm run lint && npm run typecheck
```

Set `DATABASE_URL` to use a real Postgres instead of the embedded one.

## Content pipelines

```
npm run import:legacy   # legacy/marginalia.html -> content/library.json
npm run import:vault    # Obsidian vault 03 Encounter/Curriculum -> content/course/
```

The vault importer needs the vault (set `ENCOUNTER_VAULT` if it isn't at the default iCloud
path). Collaborators without the vault edit `content/course/*.md` directly and set
`locked: true` in the frontmatter so a later import doesn't overwrite their work.

## Deploy

Railway, project **encounter**: a `web` service built from this repo's `main` branch, plus a
Postgres database. Every push to `main` deploys. Migrations run on first request. Health check:
`/api/health`. Environment: `DATABASE_URL` (from the Postgres service), `SITE_URL` (the public URL),
`ADMIN_EMAILS` (comma-separated).

Live: https://web-production-40b70.up.railway.app
