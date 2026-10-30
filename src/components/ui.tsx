import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CONFIDENCE, pick, type Confidence, type Lang } from '@/lib/i18n';

/** What each confidence label means, from docs/EDITORIAL.md. */
export const CONFIDENCE_MEANING: Record<Confidence, Record<Lang, string>> = {
  consensus: { en: 'Nearly all specialists, believing or not, agree.', es: 'Casi todos los especialistas, creyentes o no, coinciden.', pt: 'Quase todos os especialistas, crentes ou não, concordam.' },
  'strong majority': { en: 'Most agree; a real minority dissents.', es: 'La mayoría coincide; una minoría real disiente.', pt: 'A maioria concorda; uma minoria real discorda.' },
  debated: { en: 'The field is genuinely split.', es: 'El campo está realmente dividido.', pt: 'O campo está realmente dividido.' },
  'our read': { en: 'Our judgment, offered as ours.', es: 'Nuestro juicio, presentado como nuestro.', pt: 'Nosso julgamento, apresentado como nosso.' },
  rejected: { en: 'A popular claim the evidence doesn’t support.', es: 'Una idea popular que la evidencia no respalda.', pt: 'Uma ideia popular que a evidência não sustenta.' },
};

/** A frontmatter label ("my read", "debated: the two views") to its confidence key. */
export function confKey(label: string): Confidence | null {
  const k = label.split(':')[0].trim().toLowerCase();
  const key = k === 'my read' ? 'our read' : k;
  return key in CONFIDENCE ? (key as Confidence) : null;
}

const CONF_VAR: Record<Confidence, string> = {
  consensus: 'var(--c-consensus)',
  'strong majority': 'var(--c-majority)',
  debated: 'var(--c-debated)',
  'our read': 'var(--c-ours)',
  rejected: 'var(--c-rejected)',
};

/** A row of small dots, one per labelled claim: how sure the evidence is, at a glance. */
export function ConfDots({ labels, lang }: { labels: string[]; lang: Lang }) {
  const keys = labels.map(confKey).filter((k): k is Confidence => !!k);
  if (!keys.length) return <span />;
  return (
    <span className="flex gap-1" role="img" aria-label={keys.map((k) => CONFIDENCE[k][lang]).join(', ')}>
      {keys.map((k, i) => (
        <span key={i} className="h-2 w-2 rounded-full" style={{ background: CONF_VAR[k] }} />
      ))}
    </span>
  );
}

export function ConfBadge({ k, lang }: { k: Confidence; lang: Lang }) {
  return <span className="conf" data-conf={k}>{CONFIDENCE[k][lang]}</span>;
}

/** The five labels with their meanings: the trust engine, explained. */
export function ConfidenceLegend({ lang, className = '' }: { lang: Lang; className?: string }) {
  return (
    <ul className={`m-0 grid list-none gap-2 p-0 ${className}`}>
      {(Object.keys(CONFIDENCE) as Confidence[]).map((k) => (
        <li key={k} className="well flex items-center gap-3 px-3.5 py-2.5">
          <ConfBadge k={k} lang={lang} />
          <span className="sans text-[.86rem] leading-snug text-[var(--ink-soft)]">{pick(CONFIDENCE_MEANING[k], lang)}</span>
        </li>
      ))}
    </ul>
  );
}

/** Kicker, title and dek at the top of a page. */
export function PageHeader({
  kicker,
  title,
  dek,
  crumb,
  children,
  className = '',
}: {
  kicker?: React.ReactNode;
  title: React.ReactNode;
  dek?: React.ReactNode;
  crumb?: { href: string; label: string };
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={`rise pt-12 sm:pt-16 ${className}`}>
      <p className="kicker flex flex-wrap items-center gap-2">
        {crumb && (
          <>
            <Link href={crumb.href} className="kicker kicker-accent hover:text-[var(--ink)]">{crumb.label}</Link>
            <span aria-hidden="true" className="text-[var(--rule-strong)]">/</span>
          </>
        )}
        {kicker && <span className={crumb ? '' : 'kicker-accent'}>{kicker}</span>}
      </p>
      <h1 className="page-title mt-4 max-w-[22ch]">{title}</h1>
      {dek && <p className="dek mt-5">{dek}</p>}
      {children}
    </header>
  );
}

/** A section's heading row: a label, an optional title, and a link on the right. */
export function SectionHead({ id, kicker, title, href, linkLabel }: { id?: string; kicker: string; title?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="kicker kicker-accent">{kicker}</p>
        {title && <h2 id={id} className="mt-2 text-[clamp(1.5rem,1.2rem+1vw,2rem)] font-medium leading-tight tracking-[-.012em]">{title}</h2>}
      </div>
      {href && linkLabel && (
        <Link href={href} className="sans group inline-flex items-center gap-1.5 text-[.88rem] font-medium">
          {linkLabel} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

/** A circular progress meter with the count in the middle. */
export function ProgressRing({ value, total, size = 92, label }: { value: number; total: number; size?: number; label?: string }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const pct = total ? value / total : 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={label ?? `${value} / ${total}`}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--accent)" />
            <stop offset="1" stopColor="var(--gold)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--rule)" strokeWidth="7" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ring-g)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1)' }}
        />
      </svg>
      <span className="sans absolute inset-0 grid place-items-center text-center leading-none">
        <span>
          <span className="block text-[1.35rem] font-semibold text-[var(--ink)]">{value}</span>
          <span className="block text-[.68rem] text-[var(--faint)]">/ {total}</span>
        </span>
      </span>
    </div>
  );
}

/** A rounded icon tile, tinted with the accent. */
export function IconTile({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border border-[var(--glass-border)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-[var(--shadow-glass)] ${className}`}>
      {children}
    </span>
  );
}

/** A big number with a label, for dashboards. */
export function Stat({ label, value, hint, icon }: { label: string; value: React.ReactNode; hint?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="glass flex items-start gap-4 p-5">
      {icon && <IconTile>{icon}</IconTile>}
      <div className="min-w-0">
        <p className="sans text-[.8rem] font-medium text-[var(--ink-soft)]">{label}</p>
        <p className="sans mt-1 text-[1.9rem] font-semibold leading-none tracking-[-.02em] text-[var(--ink)]">{value}</p>
        {hint && <p className="sans mt-2 text-[.8rem] text-[var(--faint)]">{hint}</p>}
      </div>
    </div>
  );
}
