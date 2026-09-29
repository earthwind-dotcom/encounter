import type { Metadata } from 'next';
import Link from 'next/link';
import { requireFacilitator } from '@/lib/session';
import { getDb } from '@/lib/db';
import { cohortProgress, cohortsForFacilitator } from '@/lib/cohorts';
import { getSessions } from '@/lib/content';
import { archiveCohortAction } from '@/app/actions';
import { CreateCohortForm } from '@/components/cohort-forms';
import { getLang } from '@/lib/lang';
import { pick, t, type Lang } from '@/lib/i18n';

const COPY = {
  groups: { en: 'Groups', es: 'Grupos', pt: 'Grupos' },
  intro: {
    en: 'A group is a table working through the course together. Give people the code; they join from their own page. You’ll see which sessions each person has marked done, so you know who to check in with. You will never see their notes or where they are with following Jesus. That stays theirs.',
    es: 'Un grupo es una mesa que hace el curso junta. Dale el código a la gente; se unen desde su propia página. Verás qué sesiones marcó como hechas cada persona, para saber con quién conviene hablar. Nunca verás sus notas ni dónde están en cuanto a seguir a Jesús. Eso es de ellos.',
    pt: 'Um grupo é uma mesa que faz o curso junta. Passe o código para as pessoas; elas entram pela própria página. Você verá quais sessões cada pessoa marcou como feitas, para saber com quem conversar. Nunca verá as notas delas nem onde estão em relação a seguir Jesus. Isso é delas.',
  },
  none: { en: 'No groups yet.', es: 'Todavía no hay grupos.', pt: 'Ainda não há grupos.' },
  code: { en: 'Code', es: 'Código', pt: 'Código' },
  starts: { en: 'starts', es: 'empieza', pt: 'começa' },
  ledBy: { en: 'led by', es: 'dirigido por', pt: 'conduzido por' },
  empty: { en: 'Nobody has joined yet. Share the code at your first meal.', es: 'Nadie se ha unido todavía. Comparte el código en la primera comida.', pt: 'Ninguém entrou ainda. Compartilhe o código na primeira refeição.' },
  person: { en: 'Person', es: 'Persona', pt: 'Pessoa' },
  reopen: { en: 'Reopen group', es: 'Reabrir grupo', pt: 'Reabrir grupo' },
  archive: { en: 'Archive group', es: 'Archivar grupo', pt: 'Arquivar grupo' },
  done: { en: 'done', es: 'hecha', pt: 'feita' },
} satisfies Record<string, Record<Lang, string>>;

export async function generateMetadata(): Promise<Metadata> {
  return { title: pick(COPY.groups, await getLang()), robots: { index: false } };
}


export default async function Groups() {
  const me = await requireFacilitator();
  const db = await getDb();
  const cohorts = await cohortsForFacilitator(db, me);
  const progress = await Promise.all(cohorts.map((c) => cohortProgress(db, c.id)));
  const lang = await getLang();
  const tx = (k: keyof typeof COPY) => pick(COPY[k], lang);
  const sessions = getSessions(lang);

  return (
    <div className="shell pt-12">
      <p className="kicker"><Link href="/facilitate" className="kicker kicker-accent">{t('desk', lang)}</Link> · {tx('groups').toLowerCase()}</p>
      <h1 className="mt-3 text-[2.4rem] font-medium leading-tight">{tx('groups')}</h1>
      <p className="mt-2 max-w-2xl text-[var(--ink-soft)]">
        {tx('intro')}
      </p>
      <div className="mt-6"><CreateCohortForm lang={lang} /></div>

      {cohorts.length === 0 && <p className="mt-8 text-[var(--ink-soft)]">{tx('none')}</p>}
      {cohorts.map((c, i) => (
        <section key={c.id} className={`card mt-8 p-5 ${c.archived ? 'opacity-60' : ''}`} aria-labelledby={`g-${c.id}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id={`g-${c.id}`} className="text-[1.4rem] font-medium">{c.name}</h2>
            <p className="kicker">
              {tx('code')} <span className="mono ml-1 text-[1rem] tracking-[.25em] text-[var(--accent)]">{c.code}</span>
              {c.starts_on && <> · {pick(COPY.starts, lang)} {c.starts_on}</>}
              {me.role === 'admin' && c.facilitator_name && <> · {pick(COPY.ledBy, lang)} {c.facilitator_name}</>}
            </p>
          </div>
          {progress[i].length === 0 ? (
            <p className="mt-3 text-[.95rem] text-[var(--ink-soft)]">{pick(COPY.empty, lang)}</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-[.9rem]">
                <thead>
                  <tr>
                    <th className="kicker py-2 pr-4 text-left">{pick(COPY.person, lang)}</th>
                    {sessions.map((s) => (
                      <th key={s.n} className="kicker w-8 text-center" title={s.title}>{s.n}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {progress[i].map((m) => (
                    <tr key={m.user_id} className="border-t border-[var(--rule)]">
                      <td className="py-2 pr-4 whitespace-nowrap">{m.name}</td>
                      {sessions.map((s) => (
                        <td key={s.n} className="text-center">
                          {m.done.includes(s.n) ? <span className="text-[var(--ok)]" aria-label={`${t('session', lang)} ${s.n}: ${pick(COPY.done, lang)}`}>●</span> : <span className="text-[var(--rule)]">·</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <form action={archiveCohortAction.bind(null, c.id, !c.archived)} className="mt-4">
            <button className="kicker cursor-pointer hover:text-[var(--accent)]">{c.archived ? pick(COPY.reopen, lang) : pick(COPY.archive, lang)}</button>
          </form>
        </section>
      ))}
    </div>
  );
}
