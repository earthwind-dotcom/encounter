/**
 * Imports the Encounter course from the Obsidian vault into content/course/.
 *
 * The vault (03 Encounter/Curriculum) is where sessions are drafted. The repo copy is what
 * the app publishes, so collaborators without the vault can still work on the platform.
 *
 *   - A written session guide (Curriculum/Sessions/Session NN — *.md) becomes
 *     content/course/session-NN.md with its participant handout and facilitator guide.
 *   - A session that exists only in the Stage 1 spec becomes an outline built from the spec,
 *     marked `status: outline` so the app says plainly that the full guide is not written yet.
 *
 * An existing repo file with `locked: true` in its frontmatter is never overwritten: edit it
 * in the repo once it has diverged from the vault on purpose.
 *
 * Run: ENCOUNTER_VAULT="/path/to/Personal Vault" npm run import:vault
 */
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = path.resolve(import.meta.dirname, '..');
const VAULT =
  process.env.ENCOUNTER_VAULT ??
  path.join(process.env.HOME ?? '', 'Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal Vault');
const CURRICULUM = path.join(VAULT, '03 Encounter/Curriculum');
const OUT = path.join(ROOT, 'content/course');

if (!existsSync(CURRICULUM)) {
  console.error(`Vault curriculum not found at ${CURRICULUM}. Set ENCOUNTER_VAULT.`);
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const unwiki = (s: string) => s.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2').replace(/\[\[([^\]]+)\]\]/g, (_, t: string) => t.split('/').pop()!);

const UNITS: Record<string, { title: string; question: string }> = {
  A: { title: 'The Sources', question: 'What are we reading, and how do we read it?' },
  B: { title: 'What He Said and Did', question: 'Who was this person, on his own terms?' },
  C: { title: 'The Claim', question: 'What are Christians actually asserting?' },
  D: { title: 'Living It', question: 'If I am in, what does a life look like?' },
};

// ---- the spec: one entry per session ----
const spec = readFileSync(path.join(CURRICULUM, 'Stage 1 — The Course (13 sessions).md'), 'utf8');
interface SpecSession { n: number; unit: string; title: string; bullets: Record<string, string>; brief: string }
const specSessions: SpecSession[] = [];
let unit = 'A';
for (const block of spec.split(/\n(?=## Unit |### \d+\. )/)) {
  const u = block.match(/^## Unit ([A-D])/);
  if (u) { unit = u[1]; continue; }
  const h = block.match(/^### (\d+)\. (.+)/);
  if (!h) continue;
  const bullets: Record<string, string> = {};
  let brief = '';
  for (const m of block.matchAll(/^- \*\*([^:*]+):\*\*\s*([\s\S]*?)(?=\n- \*\*|\n---|$)/gm)) {
    const key = m[1].trim().toLowerCase();
    if (key === 'brief') brief = cap(m[2].trim());
    else bullets[key] = cap(m[2].trim().replace(/\s+/g, ' '));
  }
  specSessions.push({ n: Number(h[1]), unit, title: h[2].replace(/\*/g, '').trim(), bullets, brief: unwiki(brief) });
}

// ---- the written guides ----
const written = new Map<number, string>();
for (const f of readdirSync(path.join(CURRICULUM, 'Sessions'))) {
  const m = f.match(/^Session (\d+) — /);
  if (m) written.set(Number(m[1]), path.join(CURRICULUM, 'Sessions', f));
}

const yamlSafe = (s: string) => JSON.stringify(s);
let wrote = 0;
for (const s of specSessions) {
  const target = path.join(OUT, `session-${String(s.n).padStart(2, '0')}.md`);
  if (existsSync(target) && matter(readFileSync(target, 'utf8')).data.locked) {
    console.log(`skip session ${s.n}: locked in the repo`);
    continue;
  }
  const fm: string[] = [
    `n: ${s.n}`,
    `unit: ${s.unit}`,
    `unitTitle: ${yamlSafe(UNITS[s.unit].title)}`,
    `title: ${yamlSafe(s.title)}`,
    `question: ${yamlSafe(s.bullets.question ?? '')}`,
    `passage: ${yamlSafe(s.bullets.text ?? '')}`,
    `practice: ${yamlSafe(s.bullets.practice ?? '')}`,
    `nextStep: ${yamlSafe(s.bullets['next step'] ?? '')}`,
  ];
  const invitation = s.bullets['invitation (explicit)'] ?? s.bullets['invitation (explicit, and direct)'];
  if (invitation) fm.push(`invitation: ${yamlSafe(unwiki(invitation))}`);

  let body: string;
  const file = written.get(s.n);
  if (file) {
    const src = matter(readFileSync(file, 'utf8'));
    const text = unwiki(src.content);
    const participant = text.match(/## Participant handout[^\n]*\n([\s\S]*?)(?=\n---\s*\n## Facilitator guide|\n## Facilitator guide)/)?.[1]?.trim() ?? '';
    const facilitator = text.match(/## Facilitator guide\s*\n([\s\S]*)$/)?.[1]?.trim() ?? '';
    fm.push(`status: ${yamlSafe(String(src.data.status ?? 'draft'))}`);
    fm.push(`source: ${yamlSafe(path.basename(file))}`);
    body = `<!-- participant -->\n\n${participant}\n\n<!-- facilitator -->\n\n${facilitator}\n`;
  } else {
    fm.push('status: "outline"');
    fm.push('source: "Stage 1 — The Course (13 sessions).md"');
    const brief = s.brief
      .split('\n')
      .map((l) => l.replace(/^ {2}/, ''))
      .join('\n');
    body =
      `<!-- participant -->\n\n**The question**\n${s.bullets.question ?? ''}\n\n**The text**\n${s.bullets.text ?? ''}\n\n` +
      `**What we will look at**\n${brief}\n\n**Try this**\n${s.bullets.practice ?? ''}\n\n**One next step**\n${s.bullets['next step'] ?? ''}\n`;
  }
  writeFileSync(target, `---\n${fm.join('\n')}\n---\n\n${body}`);
  wrote++;
}

// The facilitators' plain-language presentation.
const gospel = matter(readFileSync(path.join(CURRICULUM, 'The Gospel, Plainly.md'), 'utf8'));
writeFileSync(
  path.join(OUT, 'gospel-plainly.md'),
  `---\ntitle: "The Gospel, Plainly"\naudience: facilitator\n---\n\n${unwiki(gospel.content).replace(/^# .+\n/m, '').trim()}\n`,
);

writeFileSync(path.join(OUT, 'units.json'), JSON.stringify(UNITS, null, 2) + '\n');
console.log(`wrote ${wrote} sessions (${written.size} written guides, ${specSessions.length - written.size} outlines)`);
