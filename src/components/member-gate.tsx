import Link from 'next/link';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { pick, type Lang } from '@/lib/i18n';

/** The invitation in on a public preview page: what a free account opens, and the two doors. */
export function JoinPanel({ lang, next, title, body, className = '' }: { lang: Lang; next: string; title: string; body: string; className?: string }) {
  return (
    <section className={`glass-strong relative overflow-hidden !rounded-[26px] p-6 sm:p-8 ${className}`} aria-label={title}>
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,var(--accent-glow),transparent)] blur-xl" />
      <div className="relative flex flex-wrap items-center gap-5">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]"><LockKeyhole size={20} /></span>
        <div className="min-w-0 flex-1 basis-[280px]">
          <p className="text-[1.3rem] font-medium leading-snug">{title}</p>
          <p className="mt-1 text-[.98rem] leading-relaxed text-[var(--ink-soft)]">{body}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/signup?next=${encodeURIComponent(next)}`} className="btn">{pick({ en: 'Create a free account', es: 'Crea una cuenta gratis', pt: 'Crie uma conta grátis' }, lang)} <ArrowRight size={16} /></Link>
          <Link href={`/signin?next=${encodeURIComponent(next)}`} className="btn btn-ghost">{pick({ en: 'Sign in', es: 'Entrar', pt: 'Entrar' }, lang)}</Link>
        </div>
      </div>
    </section>
  );
}

export const LockMark = ({ label }: { label: string }) => (
  <span className="inline-flex items-center text-[var(--faint)]" title={label}>
    <LockKeyhole size={14} aria-hidden="true" />
    <span className="sr-only">{label}</span>
  </span>
);
