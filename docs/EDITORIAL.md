# Editorial rules

Everything Encounter publishes follows these. `npm test` checks the ones a machine can.

## Voice

Written for someone with no church background, alone, on their phone, at a low moment.

- **Plain.** No word a 12-year-old outside church would need explained. Translate church words:
  sin, saved, grace, gospel, repent, Scripture, testimony, fellowship. If you use one, say what it
  means in the same breath.
- **Second person, warm.** Talk to the one person reading.
- **Contractions.** "You don't", not "you do not" (the imported Library keeps its own register).
- **No em dashes.** Anywhere. Use a comma, a colon, or a new sentence. *(checked)*
- **Honest about the hard parts,** before anyone else has to point them out.
- **Never assume the reader is "in".** No "we believers", no "our faith".
- **End on an open door.** Every Hard Question ends with `## Where this leaves you`: the real
  thing on offer, one small next step, and genuine freedom. *(checked)*

Also avoid: culture-war framing, decline statistics, altar-call rhythm, fear as motivation.

## Confidence labels

Five, and only five. Never invent a sixth. *(checked)*

| Label | Means |
|---|---|
| **Consensus** | Nearly all specialists, believing or not, agree |
| **Strong majority** | Most agree; a real minority dissents |
| **Debated** | The field is genuinely split |
| **Our read** | Our judgment, offered as ours |
| **Rejected** | A popular claim the evidence doesn't support |

In Markdown, write `[consensus]`, `[debated: the two views]`, or `[our read]`. The vault's
`[my read]` renders as "Our read". In question frontmatter, use the `standing:` list.

## Sources

- **Never invent a citation.** If it can't be verified against publisher, library or journal
  records, drop it rather than soften it.
- Give author, title, publisher and year. Prefer books a curious reader can actually get.
- Present the strongest skeptical voice fairly (Ehrman is on several reading lists on purpose).
- Where something is widely repeated but unchecked, say so on the page instead of printing it.

## Content status

Sessions carry `status:` in frontmatter: `outline` → `draft` → `reviewed` → `published`. The app
tells readers when a session is an outline or a draft. Hard Questions carry `reviewed: true` once
a second person has checked the facts and the sources. **As of 2026-09-28 none are reviewed.**

## Pastoral guardrails

- The goal is stated, never disguised. No bait-and-switch.
- A clear invitation, never coercion: no fear tactics, no manufactured urgency, no love-bombing.
- Never share a person's story without explicit permission and their approval of the wording.
- Anything about abuse, self-harm or crisis points to real help first (the Talk page does).
- Topics that need pastoral sign-off before publishing: sexuality and gender, abuse, suicide,
  specific churches or leaders.

## Languages

English, Spanish, Portuguese. Brand and section names (Encounter, Reflections, Roots,
Provenance) stay in English. Translate a Hard Question by adding `content/questions/<slug>.es.md`
(or `.pt.md`) with the same frontmatter keys. Untranslated pages show an honest notice. Portuguese
has not been reviewed by a native speaker.
