import type { Metadata } from 'next';
import Link from 'next/link';
import { getLang } from '@/lib/lang';
import { getLibrary, getSessions, UNITS } from '@/lib/content';
import { getCurrentUser } from '@/lib/session';
import { completedKeys } from '@/lib/learner';
import { pick, t, type Lang } from '@/lib/i18n';
import { Check, Play, Route } from 'lucide-react';
import { IconTile, PageHeader, ProgressRing } from '@/components/ui';

const SESSION = { en: 'Session', es: 'Sesión', pt: 'Sessão' };

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: pick({ en: 'The Course', es: 'El curso', pt: 'O curso' }, lang),
    description: pick({ en: 'Thirteen sessions from first curiosity to following Jesus: the sources, the person, the claim, and the life.', es: 'Trece sesiones, de la primera curiosidad a seguir a Jesús: las fuentes, la persona, la afirmación y la vida.', pt: 'Treze sessões, da primeira curiosidade a seguir Jesus: as fontes, a pessoa, a afirmação e a vida.' }, lang),
  };
}

const STATUS: Record<string, Record<Lang, string>> = {
  outline: { en: 'Outline', es: 'Esquema', pt: 'Esboço' },
  draft: { en: 'Draft', es: 'Borrador', pt: 'Rascunho' },
  reviewed: { en: 'Reviewed', es: 'Revisado', pt: 'Revisado' },
  published: { en: '', es: '', pt: '' },
};

export default async function CoursePage() {
  const lang = await getLang();
  const sessions = getSessions(lang);
  const pathway = getLibrary().encounter.articles;
  const user = await getCurrentUser();
  const done = user ? await completedKeys(user.id) : new Set<string>();
  const completed = sessions.filter((s) => done.has(`course:${s.n}`)).length;

  const next = sessions.find((s) => !done.has(`course:${s.n}`)) ?? sessions[0];

  return (
    <div className="shell">
      <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
        <PageHeader
          kicker={t('navCourse', lang)}
          title={pick({ en: 'Trust the sources. Meet the person. Weigh the claim. Start the life.', es: 'Confía en las fuentes. Conoce a la persona. Sopesa la afirmación. Empieza la vida.', pt: 'Confie nas fontes. Conheça a pessoa. Pese a afirmação. Comece a vida.' }, lang)}
          dek={pick(
            {
              en: 'Thirteen sessions, each built around one honest question and one primary text, read directly. Real scholarship with its confidence labelled, a practice to try, questions for the table, and a clear invitation. Work through it alone, with a friend, or in a group around a meal.',
              es: 'Trece sesiones, cada una construida alrededor de una pregunta honesta y un texto primario, leído directamente. Investigación real con su nivel de certeza indicado, una práctica, preguntas para la mesa y una invitación clara. Hazlo solo, con un amigo o en grupo alrededor de una comida.',
              pt: 'Treze sessões, cada uma construída em torno de uma pergunta honesta e um texto primário, lido diretamente. Pesquisa real com o grau de certeza indicado, uma prática, perguntas para a mesa e um convite claro. Faça sozinho, com um amigo ou em grupo ao redor de uma refeição.',
            },
            lang,
          )}
        />
        {next && (
          <Link href={`/course/${next.n}`} className="glass-strong lift rise rise-2 flex items-center gap-5 rounded-[24px] p-5 text-[var(--ink)] lg:w-[360px]">
            {user ? <ProgressRing value={completed} total={sessions.length} size={84} /> : <IconTile className="!h-14 !w-14 !rounded-2xl"><Play size={22} /></IconTile>}
            <span className="min-w-0">
              <span className="kicker kicker-accent">
                {user && completed > 0 ? pick({ en: 'Continue', es: 'Continúa', pt: 'Continue' }, lang) : pick({ en: 'Begin', es: 'Empieza', pt: 'Comece' }, lang)}
              </span>
              <span className="mt-1 block text-[1.08rem] font-medium leading-snug">{pick(SESSION, lang)} {next.n}: {next.title}</span>
            </span>
          </Link>
        )}
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          {(Object.keys(UNITS) as (keyof typeof UNITS)[]).map((u) => {
            const list = sessions.filter((s) => s.unit === u);
            const unitDone = list.filter((s) => done.has(`course:${s.n}`)).length;
            return (
              <section key={u} className="glass p-5 sm:p-7" aria-labelledby={`unit-${u}`}>
                <header className="flex flex-wrap items-start gap-4">
                  <span className="sans grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--gold)] text-[1.1rem] font-semibold text-[var(--on-accent)] shadow-[0_8px_20px_-8px_var(--accent-glow)]">{u}</span>
                  <div className="min-w-0 flex-1">
                    <p className="sans text-[.78rem] font-medium text-[var(--faint)]">{pick({ en: 'Unit', es: 'Unidad', pt: 'Unidade' }, lang)} {u} · {list.length} {pick({ en: 'sessions', es: 'sesiones', pt: 'sessões' }, lang)}</p>
                    <h2 id={`unit-${u}`} className="mt-0.5 text-[1.5rem] font-medium leading-tight">{pick(UNITS[u], lang)}</h2>
                    <p className="text-[.96rem] italic text-[var(--ink-soft)]">{pick(UNITS[u].q, lang)}</p>
                  </div>
                  {user && <span className={`pill ${unitDone === list.length ? 'pill-ok' : ''}`}>{unitDone} / {list.length}</span>}
                </header>
                <ol className="relative mt-5 list-none p-0">
                  {list.map((s, i) => {
                    const isDone = done.has(`course:${s.n}`);
                    return (
                      <li key={s.n} className="relative">
                        {i < list.length - 1 && <span aria-hidden="true" className="absolute left-[27px] top-12 bottom-[-6px] w-px bg-[var(--rule-strong)]" />}
                        <Link href={`/course/${s.n}`} className="group grid grid-cols-[56px_1fr_auto] items-start gap-3 rounded-2xl py-3 pr-3 text-[var(--ink)] transition-colors hover:bg-[var(--glass-inner-hover)]">
                          <span className={`sans relative z-[1] mx-auto mt-0.5 grid h-9 w-9 place-items-center rounded-full border text-[.8rem] font-semibold ${isDone ? 'border-transparent bg-[var(--ok)] text-[var(--paper)]' : 'border-[var(--rule-strong)] bg-[var(--glass-strong)] text-[var(--accent)] group-hover:border-[var(--accent)]'}`}>
                            {isDone ? <Check size={16} /> : String(s.n).padStart(2, '0')}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[1.1rem] font-medium leading-snug group-hover:text-[var(--accent)]">{s.title}</span>
                            <span className="mt-0.5 block text-[.92rem] italic leading-snug text-[var(--ink-soft)]">{s.question}</span>
                          </span>
                          <span className="pt-1">
                            {STATUS[s.status]?.[lang] && !isDone ? <span className="pill">{STATUS[s.status][lang]}</span> : null}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <nav className="glass p-5" aria-labelledby="pathway">
            <h2 id="pathway" className="kicker flex items-center gap-2"><Route size={13} /> {pick({ en: 'The whole pathway', es: 'Todo el camino', pt: 'Todo o caminho' }, lang)}</h2>
            <ol className="mt-3 list-none space-y-1 p-0">
              {pathway.map((a, i) => (
                <li key={a.slug}>
                  <Link href={`/course/pathway/${a.slug}`} className="group flex gap-3 rounded-xl p-2 text-[var(--ink)] hover:bg-[var(--glass-inner-hover)]">
                    <span className="sans mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[.7rem] font-semibold text-[var(--accent)]">{i + 1}</span>
                    <span className="min-w-0">
                      <span className="block text-[.95rem] leading-snug group-hover:text-[var(--accent)]">{pick(a.title, lang)}</span>
                      <span className="mono block text-[.66rem] text-[var(--faint)]">{a.ref}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
          <p className="sans px-1 text-[.8rem] leading-relaxed text-[var(--faint)]">
            {pick(
              {
                en: '“Outline” means the full session guide is still being researched and written. “Draft” means it is written and awaiting review.',
                es: '«Esquema» significa que la guía completa aún se está investigando y escribiendo. «Borrador» significa que está escrita y pendiente de revisión.',
                pt: '“Esboço” significa que o guia completo ainda está sendo pesquisado e escrito. “Rascunho” significa que está escrito e aguardando revisão.',
              },
              lang,
            )}
          </p>
        </aside>
      </div>
    </div>
  );
}
