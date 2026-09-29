# Encounter: the game plan

Where this platform is going, why, and in what order. Written 2026-09-28, when Marginalia
became Encounter. Update the **Status** column as phases land; keep the reasoning.

## The aim, in one line

Help people in a post-Christian culture, who assume they already know what Christianity is,
meet the real Jesus and read the Bible as alive: through honest scholarship, straight answers to
the hard questions, and a clear invitation to follow him, with real freedom to say no.

## What makes Encounter different

The field is crowded with good tools. None of them does this combination.

| | What they do well | What they don't do |
|---|---|---|
| **Alpha** | Welcome, meal, small groups at scale; free; an app for group logistics | A house position on every question; the "Holy Spirit weekend" as the emotional peak; little primary-text reading |
| **Jesus Disciple (Subsplash)** | Daily and weekly checklists, meetings and chat, a media library; free | Assumes buy-in; discipleship for people already in; no engagement with doubt or scholarship |
| **RightNow Media** | 25,000+ videos, "Watch Together", roadmaps, 13 languages | A streaming library, not a pathway; content for church members |
| **BibleProject** | Beautiful visual theology; the Bible as one unified story that leads to Jesus; free classes | Built for people already reading; less on apologetics and the questions that stop outsiders |
| **The Bible for Normal People** | Honest, plain-spoken scholarship; the Bible as a human-and-divine conversation | A podcast and courses, not a pathway to following Jesus; no invitation |
| **YouVersion** | Reach, reading plans, habit loops | Devotional, not investigative |

**Encounter's position:** the investigative front door. BibleProject's love for the whole story,
the Bible for Normal People's honesty and voice, Alpha's welcome and table, and a university
course's spine, pointed at one thing: meeting Jesus. The differentiators we protect:

1. **Hard questions first.** The question *is* the lesson. We don't defend the Bible by quoting
   the Bible; we show evidence, label our confidence, and name the real debates.
2. **Five confidence labels, on every claim.** Consensus · Strong majority · Debated · Our read ·
   Rejected. Nobody else does this. It is our trust engine.
3. **Never invent a citation.** Everything checkable is checked, or cut.
4. **Primary text read directly**, every session.
5. **A real invitation, never coercion.** Every piece ends on an open door. No fear, no pressure,
   no bait-and-switch. We count people, not scalps.
6. **Plain language** for someone with no church background, in English, Spanish and Portuguese.

## Theology: what we ground people in

The goal is faith that lasts, which means faith grounded in the right center.

- **Jesus is the center, not a theory of the Bible.** Jesus is the Word of God in person; the
  Bible is the witness that points to him. People can meet him before they have resolved every
  question about Genesis. (Session 2; Hard Question "whole-bible".)
- **The resurrection is the hinge.** Everything is built to bring people honestly to that claim
  and let them weigh it. (Session 9; Hard Question "resurrection".)
- **The good news is a gift and a king, not a moral program.** Most post-Christian people were
  inoculated against moralism-with-a-halo. We say what Christianity actually claims.
  (Hard Question "being-a-good-person"; The Gospel, Plainly.)
- **Serious, not literal.** Read each part of the Bible as the kind of writing it is.
- **Honest about the hard parts:** suffering, violence in the Old Testament, hell, the church's
  record. Faith that has already faced these is the kind that survives contact with them later.
- **Faith as trust and allegiance** (*pistis*), not certainty. Doubters are welcome and can follow.
- **Community is part of it.** A decision without people, practice and follow-up leads nowhere.
  Stage 3 exists for that.

Research base, used and cited: N. T. Wright, Dale Allison, E. P. Sanders, John Meier, Richard
Bauckham, Craig Keener, Larry Hurtado, Peter Enns, the BibleProject, and the strongest skeptical
voices (Bart Ehrman) presented fairly. Every source is listed on the page that uses it.

## Phases

### Phase 1: Foundation. **Done 2026-09-28.**

- Marginalia rebuilt as **Encounter**: a Next.js 16 app on Railway with Postgres.
- All 46 Marginalia articles imported with their translations (Library, pathway, About).
- The 13-session course: 5 written guides (1, 2, 3, 4, 9) with participant and facilitator
  views; 8 honest outlines from the spec.
- **Hard Questions**, a new flagship section: 14 answers, each with a short answer, a long
  answer, confidence-labelled claims, further reading, related research, and an open door.
- Accounts (optional; everything is readable without one), progress, private notes, a private
  "where are you with following Jesus" answer.
- "Talk to someone": a real person reads every message; a facilitator desk to reply and track.
- Roles: learner, facilitator (sees facilitator guides and messages), admin.
- Tests for auth, content rules (no em dashes, only the five labels, every link resolves,
  translations kept), and CI.

Also shipped the same day, beyond the original Phase 1 scope:

- **18 Hard Questions**, all in English and Spanish.
- **All 13 course sessions** written (drafts awaiting review).
- **Groups** (the core of Phase 3's cohorts): a facilitator starts a group, members join with a
  code, the facilitator sees session completion only.
- **Site search** (restored from Marginalia), accent-insensitive.
- **Admin-issued password reset links** (stopgap until email).
- **About pages rewritten** for Encounter, including an honest status page.
- **Interface in Spanish and Portuguese** on all public pages.

### Phase 2: Finish the course content. **In progress.**

The platform's worth is its content.

1. **Done 2026-09-28:** all 13 sessions now have full participant and facilitator guides.
   Sessions 5–8 and 10–13 were drafted by an agent from the Stage 1 spec, the
   `turn-the-other-cheek` worksheet, and standard scholarship. **All 13 are `draft`:** none has
   been reviewed, and 4, 9 and 5–13 have unchecked citations. Review them in order, check every
   source against publisher records, and set `status: reviewed` in the vault file.
2. **Done 2026-09-28:** Spanish for all 13 sessions (participant and facilitator guides), The
   Gospel, Plainly, and the four About pages, plus the rest of the interface (account, groups,
   facilitator desk, privacy, password reset, error messages). Bible passages are working
   translations labelled as such; pick a licensed Spanish text (NVI or DHH) at review. Spanish
   files are `session-NN.es.md` beside the English and are not touched by the vault importer, so
   **when an English session changes, update its Spanish file in the same PR**. Tests check that
   each Spanish session keeps its unit, status and every confidence label. Still to translate:
   22 Library articles (about 27,000 words). Portuguese next.
3. Add the missing topics the vault flagged: a session or Hard Question on **the Holy Spirit**,
   on **evil**, and on **suffering** as its own session. Testimony, with permission.
4. More Hard Questions, human-written with pastoral review before publishing:
   - Sexuality and gender (handle with the guardrails; needs pastoral sign-off).
   - "Isn't Christianity anti-women?"
   - "What does it actually mean to follow Jesus day to day?"
   - "Why would a loving God need a sacrifice?"
   - "What about the Crusades / colonialism / slavery?"
   - "Is the Bible we have what they wrote?" (textual criticism)
   - "Did Jesus claim to be God?" (Hurtado, Bauckham, Ehrman)
   - "What happens when we die?"
5. **Spanish first, then Portuguese** for Hard Questions (`<slug>.es.md` files are already
   supported) and for the course. Native-speaker review of Portuguese.

### Phase 3: The learning experience (industry-leading LMS features)

- **Cohorts.** *Done 2026-09-28 (`/facilitate/groups`).* Still to add: scheduling each week's
  session date, attendance, and a facilitator note per member that the member can see.
- **Printable handouts** per session (a print stylesheet exists; add a one-page layout).
- **Self-paced mode** with gentle nudges: "one session a week" email reminders (needs an email
  provider; see Phase 5) and a weekly practice card.
- **Practices tracker**: the course's weekly practices (silence, examen, lectio) as a simple
  daily check-in, the habit loop YouVersion does well, pointed at Jesus.
- **Passage reader**: open the session's primary text inline (licensed translation needed:
  NRSVue, NET or WEB; the WEB is public domain and a safe start).
- **Search** across questions, sessions and library. *Done 2026-09-28 (`/search`).*
- **Video and audio**: a short (5 to 8 minute) talk per session and per Hard Question, the thing
  Alpha and RightNow do well. Audio versions for commuters.
- **Accessibility**: WCAG 2.2 AA audit; screen-reader pass.

### Phase 4: Guided conversation (AI, carefully)

A "pastor AI" was raised in the vault. The honest version:

- **Retrieval, not fine-tuning.** An assistant that answers only from Encounter's own published
  content, cites the page it drew from, uses the confidence labels, and hands off to a real
  person for anything pastoral (grief, abuse, crisis, "I want to follow Jesus").
- Guardrails: never claims to be a person, never gives a confidence label the content doesn't,
  never pressures, logs nothing identifying without consent.
- Build it only after Phase 2, because it's only as good as the content behind it.

### Phase 5: Reach and operations

- **A real domain** (the single biggest gap from Marginalia) and a contact address that isn't a
  personal Gmail. Set `SITE_URL` in Railway.
- **Email** (Postmark or Resend): password reset, cohort invites, reminders. Password reset is
  the first thing that needs it.
- **Instagram account** (the vault's front door, Stage 0) linking to specific Hard Questions.
- **Privacy review** for the jurisdiction it operates in; analytics that are cookie-free
  (Plausible) if any.
- **Faith Chapel pilot**: first cohort, facilitator training, the monthly open Q&A night.
- **Wonder** (children's): only after the research pass on existing children's material.

## Measures (honest ones)

We count people, not scalps. Track what shows real engagement, and never inflate:

- Readers who finish a Hard Question; sessions completed; people who come back a second week.
- Conversations requested, and how fast a real person replies (target: under 48 hours).
- People who say "ready to start" or "following" (aggregate only; individual answers are private).
- Cohorts run, and people who move into Stage 2 and Stage 3.

## Architecture decisions (why it's built this way)

- **Next.js 16 + Postgres on Railway**: same stack as the other projects, one deploy, auto-deploy
  from `main`. PGlite (embedded Postgres) locally so no one needs a database installed.
- **Content in the repo as Markdown and JSON**, not a CMS, for now. Editors are few and
  technical; git gives review and history. Revisit when non-technical writers join.
- **No auth vendor.** scrypt passwords, hashed session tokens, rate-limited sign-in. Revisit if
  social login or passwordless email is wanted.
- **Readable without an account, always.** Accounts add memory, never access.
