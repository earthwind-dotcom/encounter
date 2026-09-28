import type { Metadata } from 'next';
import Link from 'next/link';
import { getLang } from '@/lib/lang';
import { getLibrary, getSessions, UNITS } from '@/lib/content';
import { getCurrentUser } from '@/lib/session';
import { completedKeys } from '@/lib/learner';
import { pick, t, type Lang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'The Course',
  description: 'Thirteen sessions from first curiosity to following Jesus: the sources, the person, the claim, and the life.',
};

const STATUS: Record<string, Record<Lang, string>> = {
  outline: { en: 'Outline', es: 'Esquema', pt: 'Esboço' },
  draft: { en: 'Draft', es: 'Borrador', pt: 'Rascunho' },
  reviewed: { en: 'Reviewed', es: 'Revisado', pt: 'Revisado' },
  published: { en: '', es: '', pt: '' },
};

export default async function CoursePage() {
  const lang = await getLang();
  const sessions = getSessions();
  const pathway = getLibrary().encounter.articles;
  const user = await getCurrentUser();
  const done = user ? await completedKeys(user.id) : new Set<string>();
  const completed = sessions.filter((s) => done.has(`course:${s.n}`)).length;

  return (
    <div className="shell pt-12">
      <p className="kicker kicker-accent">{t('navCourse', lang)}</p>
      <h1 className="mt-3 max-w-[22ch] text-[clamp(2.1rem,1.4rem+2.6vw,3.2rem)] font-medium leading-tight">
        {pick(
          {
            en: 'Trust the sources. Meet the person. Weigh the claim. Start the life.',
            es: 'Confía en las fuentes. Conoce a la persona. Sopesa la afirmación. Empieza la vida.',
            pt: 'Confie nas fontes. Conheça a pessoa. Pese a afirmação. Comece a vida.',
          },
          lang,
        )}
      </h1>
      <p className="mt-4 max-w-[62ch] text-[1.08rem] text-[var(--ink-soft)]">
        {pick(
          {
            en: 'Thirteen sessions, each built around one honest question and one primary text, read directly. Real scholarship with its confidence labelled, a practice to try, questions for the table, and a clear invitation. Work through it alone, with a friend, or in a group around a meal.',
            es: 'Trece sesiones, cada una construida alrededor de una pregunta honesta y un texto primario, leído directamente. Investigación real con su nivel de certeza indicado, una práctica, preguntas para la mesa y una invitación clara. Hazlo solo, con un amigo o en grupo alrededor de una comida.',
            pt: 'Treze sessões, cada uma construída em torno de uma pergunta honesta e um texto primário, lido diretamente. Pesquisa real com o grau de certeza indicado, uma prática, perguntas para a mesa e um convite claro. Faça sozinho, com um amigo ou em grupo ao redor de uma refeição.',
          },
          lang,
        )}
      </p>
      {user && (
        <div className="mt-6 max-w-md" aria-label="Your progress">
          <div className="flex justify-between kicker">
            <span>{t('account', lang)}</span>
            <span>{completed} / {sessions.length}</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-[var(--rule)]">
            <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${(completed / sessions.length) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_300px]">
        <div>
          {(Object.keys(UNITS) as (keyof typeof UNITS)[]).map((u) => (
            <section key={u} className="mb-12" aria-labelledby={`unit-${u}`}>
              <header className="border-b border-[var(--rule)] pb-3">
                <p className="kicker kicker-accent">Unit {u}</p>
                <h2 id={`unit-${u}`} className="mt-1 text-[1.5rem] font-medium">{pick(UNITS[u], lang)}</h2>
                <p className="text-[.98rem] italic text-[var(--ink-soft)]">{pick(UNITS[u].q, lang)}</p>
              </header>
              <ol className="list-none p-0">
                {sessions
                  .filter((s) => s.unit === u)
                  .map((s) => (
                    <li key={s.n} className="border-b border-[var(--rule)]">
                      <Link href={`/course/${s.n}`} className="group grid grid-cols-[2.4rem_1fr_auto] gap-3 py-4 text-[var(--ink)]">
                        <span className="mono pt-1 text-[.85rem] text-[var(--accent)]">{String(s.n).padStart(2, '0')}</span>
                        <span>
                          <span className="block text-[1.12rem] leading-snug group-hover:text-[var(--accent)]">{s.title}</span>
                          <span className="mt-1 block text-[.93rem] italic text-[var(--ink-soft)]">{s.question}</span>
                        </span>
                        <span className="kicker pt-1 text-right">
                          {done.has(`course:${s.n}`) ? <span className="text-[var(--ok)]">✓</span> : STATUS[s.status]?.[lang]}
                        </span>
                      </Link>
                    </li>
                  ))}
              </ol>
            </section>
          ))}
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <nav className="card p-5" aria-labelledby="pathway">
            <h2 id="pathway" className="kicker">{pick({ en: 'The whole pathway', es: 'Todo el camino', pt: 'Todo o caminho' }, lang)}</h2>
            <ul className="mt-3 list-none p-0">
              {pathway.map((a) => (
                <li key={a.slug} className="border-t border-[var(--rule)] py-2 first:border-t-0">
                  <Link href={`/course/pathway/${a.slug}`} className="block text-[.98rem] leading-snug">
                    {pick(a.title, lang)}
                    <span className="mono block text-[.68rem] text-[var(--faint)]">{a.ref}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="mt-4 text-[.9rem] italic text-[var(--faint)]">
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
