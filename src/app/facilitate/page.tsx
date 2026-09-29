import type { Metadata } from 'next';
import Link from 'next/link';
import { requireFacilitator } from '@/lib/session';
import { getDb } from '@/lib/db';
import { setRequestStatus, setRole } from '@/app/actions';
import { ResetLinkButton } from '@/components/reset-form';
import { getLang } from '@/lib/lang';
import { pick, t, type Lang } from '@/lib/i18n';

const COPY = {
  conversations: { en: 'Conversations', es: 'Conversaciones', pt: 'Conversas' },
  intro: {
    en: 'People who asked to talk. Reply personally, from your own address, and mark each one when you have. Count people, not scalps: these numbers are for noticing who needs a reply, not for reporting decisions.',
    es: 'Personas que pidieron hablar. Responde en persona, desde tu propio correo, y marca cada una cuando lo hayas hecho. Contamos personas, no trofeos: estos números sirven para ver quién necesita respuesta, no para reportar decisiones.',
    pt: 'Pessoas que pediram para conversar. Responda pessoalmente, do seu próprio endereço, e marque cada uma quando tiver respondido. Contamos pessoas, não troféus: estes números servem para ver quem precisa de resposta, não para relatar decisões.',
  },
  accounts: { en: 'Accounts', es: 'Cuentas', pt: 'Contas' },
  sayReady: { en: 'Say “ready to start”', es: 'Dicen «listo para empezar»', pt: 'Dizem “pronto para começar”' },
  sayFollowing: { en: 'Say “following”', es: 'Dicen «siguiéndolo»', pt: 'Dizem “seguindo”' },
  course: { en: 'Course', es: 'Curso', pt: 'Curso' },
  groups: { en: 'Groups →', es: 'Grupos →', pt: 'Grupos →' },
  guide: { en: 'Guide', es: 'Guía', pt: 'Guia' },
  gospel: { en: 'The Gospel, Plainly →', es: 'El evangelio, en claro →', pt: 'O evangelho, com clareza →' },
  noMessages: { en: 'No messages yet.', es: 'Todavía no hay mensajes.', pt: 'Ainda não há mensagens.' },
  general: { en: 'general', es: 'general', pt: 'geral' },
  people: { en: 'People and roles', es: 'Personas y roles', pt: 'Pessoas e papéis' },
  rolesNote: {
    en: 'Facilitators can read conversation requests and facilitator guides. They cannot read anyone’s notes.',
    es: 'Los facilitadores pueden leer las solicitudes de conversación y las guías para facilitadores. No pueden leer las notas de nadie.',
    pt: 'Facilitadores podem ler os pedidos de conversa e os guias do facilitador. Não podem ler as notas de ninguém.',
  },
  name: { en: 'Name', es: 'Nombre', pt: 'Nome' },
  email: { en: 'Email', es: 'Correo', pt: 'E-mail' },
  role: { en: 'Role', es: 'Rol', pt: 'Papel' },
} satisfies Record<string, Record<Lang, string>>;

const STATUS = {
  new: { en: 'new', es: 'nueva', pt: 'nova' },
  replied: { en: 'replied', es: 'respondida', pt: 'respondida' },
  closed: { en: 'closed', es: 'cerrada', pt: 'fechada' },
};
const MARK = {
  new: { en: 'Mark new', es: 'Marcar nueva', pt: 'Marcar nova' },
  replied: { en: 'Mark replied', es: 'Marcar respondida', pt: 'Marcar respondida' },
  closed: { en: 'Mark closed', es: 'Marcar cerrada', pt: 'Marcar fechada' },
};
const ROLE = {
  learner: { en: 'learner', es: 'participante', pt: 'participante' },
  facilitator: { en: 'facilitator', es: 'facilitador', pt: 'facilitador' },
  admin: { en: 'admin', es: 'admin', pt: 'admin' },
};
const MAKE = { en: 'make', es: 'hacer', pt: 'tornar' };

export async function generateMetadata(): Promise<Metadata> {
  return { title: t('desk', await getLang()), robots: { index: false } };
}


interface Req { id: number; name: string; contact: string; topic: string; message: string; lang: string; status: string; created_at: Date }
interface U { id: number; name: string; email: string; role: string; created_at: Date }

export default async function Facilitate() {
  const me = await requireFacilitator();
  const lang = await getLang();
  const c = (k: keyof typeof COPY) => pick(COPY[k], lang);
  const db = await getDb();
  const [requests, users, [counts]] = await Promise.all([
    db.query<Req>(`SELECT id, name, contact, topic, message, lang, status, created_at FROM conversation_requests
                   ORDER BY (status = 'new') DESC, created_at DESC LIMIT 100`),
    me.role === 'admin' ? db.query<U>('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 200') : Promise.resolve([] as U[]),
    // Aggregate only. Individual stages are private to each person.
    db.query<{ users: number; ready: number; following: number }>(`SELECT
        (SELECT count(*)::int FROM users) AS users,
        (SELECT count(*)::int FROM journey_stage WHERE stage = 'ready') AS ready,
        (SELECT count(*)::int FROM journey_stage WHERE stage = 'following') AS following`),
  ]);
  const fmt = (d: Date) => new Date(d).toLocaleString({ en: 'en-US', es: 'es-MX', pt: 'pt-BR' }[lang], { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="shell pt-12">
      <p className="kicker kicker-accent">{t('desk', lang)}</p>
      <h1 className="mt-3 text-[2.4rem] font-medium leading-tight">{c('conversations')}</h1>
      <p className="mt-2 max-w-2xl text-[var(--ink-soft)]">
        {c('intro')}
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="card px-5 py-3"><span className="kicker">{c('accounts')}</span><span className="block text-[1.6rem]">{counts.users}</span></div>
        <div className="card px-5 py-3"><span className="kicker">{c('sayReady')}</span><span className="block text-[1.6rem]">{counts.ready}</span></div>
        <div className="card px-5 py-3"><span className="kicker">{c('sayFollowing')}</span><span className="block text-[1.6rem]">{counts.following}</span></div>
 <Link href="/facilitate/groups" className="card px-5 py-3 text-[var(--ink)] hover:border-[var(--accent)]">
          <span className="kicker">{c('course')}</span><span className="block">{c('groups')}</span>
        </Link>
        <Link href="/course/gospel-plainly" className="card px-5 py-3 text-[var(--ink)] hover:border-[var(--accent)]">
          <span className="kicker">{c('guide')}</span><span className="block">{c('gospel')}</span>
        </Link>
      </div>

      <ul className="mt-10 list-none p-0">
        {requests.length === 0 && <li className="text-[var(--ink-soft)]">{c('noMessages')}</li>}
        {requests.map((r) => (
          <li key={r.id} className={`card mb-4 p-5 ${r.status === 'new' ? 'border-[var(--accent)]' : 'opacity-75'}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium">
                {r.name} <span className="mono text-[.8rem] text-[var(--ink-soft)]">{r.contact}</span>
              </p>
              <p className="kicker">{r.topic || c('general')} · {r.lang} · {fmt(r.created_at)} · {pick(STATUS[r.status as keyof typeof STATUS], lang) || r.status}</p>
            </div>
            <p className="mt-2 whitespace-pre-line text-[.98rem]">{r.message}</p>
            <div className="mt-3 flex gap-2">
              {(['replied', 'closed', 'new'] as const)
                .filter((s) => s !== r.status)
                .map((s) => (
                  <form key={s} action={setRequestStatus.bind(null, r.id, s)}>
                    <button className="btn btn-ghost !py-1.5 !text-[.66rem]">{pick(MARK[s], lang)}</button>
                  </form>
                ))}
            </div>
          </li>
        ))}
      </ul>

      {me.role === 'admin' && (
        <section className="mt-14">
          <h2 className="text-[1.6rem] font-medium">{c('people')}</h2>
          <p className="mt-1 text-[.95rem] text-[var(--ink-soft)]">{c('rolesNote')}</p>
          <table className="mt-4 w-full border-collapse text-[.95rem]">
            <thead>
              <tr className="kicker text-left"><th className="py-2">{c('name')}</th><th>{c('email')}</th><th>{c('role')}</th><th /></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-[var(--rule)]">
                  <td className="py-2">{u.name}</td>
                  <td className="mono text-[.8rem]">{u.email}</td>
                  <td>{pick(ROLE[u.role as keyof typeof ROLE], lang) || u.role}</td>
                  <td className="text-right">
                    {u.id !== me.id &&
                      (['learner', 'facilitator', 'admin'] as const)
                        .filter((r) => r !== u.role)
                        .map((r) => (
                          <form key={r} action={setRole.bind(null, u.id, r)} className="inline">
                            <button className="kicker ml-3 cursor-pointer hover:text-[var(--accent)]">{pick(MAKE, lang)} {pick(ROLE[r], lang)}</button>
                          </form>
                        ))}
                    {u.id !== me.id && <ResetLinkButton userId={u.id} lang={lang} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
