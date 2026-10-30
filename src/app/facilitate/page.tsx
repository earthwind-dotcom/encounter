import type { Metadata } from 'next';
import Link from 'next/link';
import { requireFacilitator } from '@/lib/session';
import { getDb } from '@/lib/db';
import { setRequestStatus, setRole } from '@/app/actions';
import { ResetLinkButton } from '@/components/reset-form';
import { getLang } from '@/lib/lang';
import { pick, t, type Lang } from '@/lib/i18n';
import { BookHeart, Footprints, Inbox, ShieldCheck, Sunrise, Users, UsersRound } from 'lucide-react';
import { IconTile, PageHeader, Stat } from '@/components/ui';

const COPY = {
  conversations: { en: 'Conversations', es: 'Conversaciones', pt: 'Conversas' },
  intro: {
    en: 'People who asked to talk. Reply personally, from your own address, and mark each one when you have. Count people, not scalps: these numbers are for noticing who needs a reply, not for reporting decisions.',
    es: 'Personas que pidieron hablar. Responde en persona, desde tu propio correo, y marca cada una cuando lo hayas hecho. Contamos personas, no trofeos: estos números sirven para ver quién necesita respuesta, no para reportar decisiones.',
    pt: 'Pessoas que pediram para conversar. Responda pessoalmente, do seu próprio endereço, e marque cada uma quando tiver respondido. Contamos pessoas, não troféus: estes números servem para ver quem precisa de resposta, não para relatar decisões.',
  },
  accounts: { en: 'Accounts', es: 'Cuentas', pt: 'Contas' },
  waiting: { en: 'Waiting for a reply', es: 'Esperan respuesta', pt: 'Aguardando resposta' },
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

  const fresh = requests.filter((r) => r.status === 'new').length;
  const initials = (n: string) => n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '·';

  return (
    <div className="shell">
      <PageHeader kicker={t('desk', lang)} title={c('conversations')} dek={c('intro')} />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={c('waiting')} value={fresh} icon={<Inbox size={19} />} />
        <Stat label={c('accounts')} value={counts.users} icon={<UsersRound size={19} />} />
        <Stat label={c('sayReady')} value={counts.ready} icon={<Sunrise size={19} />} />
        <Stat label={c('sayFollowing')} value={counts.following} icon={<Footprints size={19} />} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Link href="/facilitate/groups" className="glass lift flex items-center gap-4 p-5 text-[var(--ink)]">
          <IconTile><Users size={19} /></IconTile>
          <span className="flex-1"><span className="kicker">{c('course')}</span><span className="block font-medium">{c('groups')}</span></span>
        </Link>
        <Link href="/course/gospel-plainly" className="glass lift flex items-center gap-4 p-5 text-[var(--ink)]">
          <IconTile><BookHeart size={19} /></IconTile>
          <span className="flex-1"><span className="kicker">{c('guide')}</span><span className="block font-medium">{c('gospel')}</span></span>
        </Link>
      </div>

      <ul className="mt-10 list-none space-y-4 p-0">
        {requests.length === 0 && (
          <li className="glass flex flex-col items-center gap-3 p-12 text-center text-[var(--ink-soft)]">
            <IconTile><Inbox size={19} /></IconTile>
            {c('noMessages')}
          </li>
        )}
        {requests.map((r) => (
          <li key={r.id} className={`glass relative overflow-hidden p-5 sm:p-6 ${r.status === 'new' ? '' : 'opacity-80'}`}>
            {r.status === 'new' && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[var(--accent)] to-[var(--gold)]" />}
            <div className="flex flex-wrap items-start gap-4">
              <span className="sans grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[.78rem] font-semibold text-[var(--accent)]">{initials(r.name)}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-snug">{r.name}</p>
                <p className="mono text-[.76rem] text-[var(--ink-soft)]">{r.contact}</p>
              </div>
              <div className="sans flex flex-wrap items-center gap-1.5">
                <span className={`pill ${r.status === 'new' ? 'pill-accent' : r.status === 'replied' ? 'pill-ok' : ''}`}>{pick(STATUS[r.status as keyof typeof STATUS], lang) || r.status}</span>
                <span className="pill">{r.topic || c('general')}</span>
                <span className="pill uppercase">{r.lang}</span>
                <span className="text-[.76rem] text-[var(--faint)]">{fmt(r.created_at)}</span>
              </div>
            </div>
            <p className="well mt-4 whitespace-pre-line p-4 text-[.98rem] leading-relaxed">{r.message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(['replied', 'closed', 'new'] as const)
                .filter((st) => st !== r.status)
                .map((st) => (
                  <form key={st} action={setRequestStatus.bind(null, r.id, st)}>
                    <button className="btn btn-ghost btn-sm">{pick(MARK[st], lang)}</button>
                  </form>
                ))}
            </div>
          </li>
        ))}
      </ul>

      {me.role === 'admin' && (
        <section className="glass mt-12 p-5 sm:p-7" aria-labelledby="people">
          <h2 id="people" className="flex items-center gap-2.5 text-[1.4rem] font-medium"><ShieldCheck size={19} className="text-[var(--accent)]" /> {c('people')}</h2>
          <p className="sans mt-1 text-[.88rem] text-[var(--ink-soft)]">{c('rolesNote')}</p>
          <div className="mt-5 overflow-x-auto">
            <table className="sans w-full border-collapse text-[.88rem]">
              <thead>
                <tr className="text-left text-[.76rem] text-[var(--faint)]">
                  <th className="px-3 py-2 font-medium">{c('name')}</th>
                  <th className="px-3 py-2 font-medium">{c('email')}</th>
                  <th className="px-3 py-2 font-medium">{c('role')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-[var(--rule)] hover:bg-[var(--glass-inner-hover)]">
                    <td className="px-3 py-2.5 font-medium">{u.name}</td>
                    <td className="mono px-3 text-[.76rem] text-[var(--ink-soft)]">{u.email}</td>
                    <td className="px-3"><span className={`pill ${u.role === 'admin' ? 'pill-accent' : u.role === 'facilitator' ? 'pill-ok' : ''}`}>{pick(ROLE[u.role as keyof typeof ROLE], lang) || u.role}</span></td>
                    <td className="whitespace-nowrap px-3 text-right">
                      {u.id !== me.id &&
                        (['learner', 'facilitator', 'admin'] as const)
                          .filter((r) => r !== u.role)
                          .map((r) => (
                            <form key={r} action={setRole.bind(null, u.id, r)} className="inline">
                              <button className="ml-1 cursor-pointer rounded-full px-2.5 py-1 text-[.76rem] text-[var(--ink-soft)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]">{pick(MAKE, lang)} {pick(ROLE[r], lang)}</button>
                            </form>
                          ))}
                      {u.id !== me.id && <ResetLinkButton userId={u.id} lang={lang} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
