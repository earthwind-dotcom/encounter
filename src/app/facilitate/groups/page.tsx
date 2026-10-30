import type { Metadata } from 'next';
import { requireFacilitator } from '@/lib/session';
import { getDb } from '@/lib/db';
import { cohortProgress, cohortsForFacilitator } from '@/lib/cohorts';
import { getSessions } from '@/lib/content';
import { archiveCohortAction } from '@/app/actions';
import { CreateCohortForm } from '@/components/cohort-forms';
import { getLang } from '@/lib/lang';
import { pick, t, type Lang } from '@/lib/i18n';
import { Archive, ArchiveRestore, CalendarDays, Check, Users } from 'lucide-react';
import { IconTile, PageHeader } from '@/components/ui';

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
    <div className="shell">
      <PageHeader crumb={{ href: '/facilitate', label: t('desk', lang) }} kicker={tx('groups')} title={tx('groups')} dek={tx('intro')} />
      <div className="mt-8"><CreateCohortForm lang={lang} /></div>

      {cohorts.length === 0 && (
        <div className="glass mt-8 flex flex-col items-center gap-3 p-12 text-center text-[var(--ink-soft)]">
          <IconTile><Users size={19} /></IconTile>
          {tx('none')}
        </div>
      )}
      {cohorts.map((c, i) => {
        const members = progress[i];
        const pct = members.length ? Math.round((members.reduce((n, m) => n + m.done.length, 0) / (members.length * sessions.length)) * 100) : 0;
        return (
          <section key={c.id} className={`glass mt-6 p-5 sm:p-7 ${c.archived ? 'opacity-60' : ''}`} aria-labelledby={`g-${c.id}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 id={`g-${c.id}`} className="text-[1.4rem] font-medium leading-tight">{c.name}</h2>
                <p className="sans mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[.82rem] text-[var(--ink-soft)]">
                  <span>{members.length} {members.length === 1 ? pick({ en: 'person', es: 'persona', pt: 'pessoa' }, lang) : pick({ en: 'people', es: 'personas', pt: 'pessoas' }, lang)}</span>
                  {c.starts_on && <span className="inline-flex items-center gap-1"><CalendarDays size={13} /> {pick(COPY.starts, lang)} {c.starts_on}</span>}
                  {me.role === 'admin' && c.facilitator_name && <span>{pick(COPY.ledBy, lang)} {c.facilitator_name}</span>}
                </p>
              </div>
              <div className="well flex items-center gap-3 px-4 py-2.5">
                <span className="kicker">{tx('code')}</span>
                <span className="mono text-[1.1rem] font-medium tracking-[.25em] text-[var(--accent)]">{c.code}</span>
              </div>
            </div>
            {members.length === 0 ? (
              <p className="well mt-5 p-4 text-[.95rem] text-[var(--ink-soft)]">{pick(COPY.empty, lang)}</p>
            ) : (
              <>
                <div className="mt-5 flex items-center gap-3">
                  <div className="bar flex-1"><span style={{ width: `${pct}%` }} /></div>
                  <span className="sans text-[.8rem] font-medium text-[var(--ink-soft)]">{pct}%</span>
                </div>
                <div className="well mt-4 overflow-x-auto p-2">
                  <table className="sans w-full border-collapse text-[.86rem]">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-[.74rem] font-medium text-[var(--faint)]">{pick(COPY.person, lang)}</th>
                        {sessions.map((s) => (
                          <th key={s.n} className="w-9 text-center text-[.72rem] font-medium text-[var(--faint)]" title={s.title}>{s.n}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m) => (
                        <tr key={m.user_id} className="border-t border-[var(--rule)]">
                          <td className="whitespace-nowrap px-3 py-2.5 font-medium">{m.name}</td>
                          {sessions.map((s) => (
                            <td key={s.n} className="text-center">
                              {m.done.includes(s.n) ? (
                                <span role="img" className="mx-auto grid h-6 w-6 place-items-center rounded-md bg-[var(--ok)] text-[var(--paper)]" aria-label={`${t('session', lang)} ${s.n}: ${pick(COPY.done, lang)}`}><Check size={13} strokeWidth={3} /></span>
                              ) : (
                                <span className="mx-auto block h-6 w-6 rounded-md bg-[var(--glass-inner-2)] ring-1 ring-inset ring-[var(--rule)]" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            <form action={archiveCohortAction.bind(null, c.id, !c.archived)} className="mt-4">
              <button className="btn btn-ghost btn-sm">{c.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />} {c.archived ? pick(COPY.reopen, lang) : pick(COPY.archive, lang)}</button>
            </form>
          </section>
        );
      })}
    </div>
  );
}
