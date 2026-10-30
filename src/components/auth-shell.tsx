import { Check } from 'lucide-react';
import { Mark } from './site-header';

/** Sign-in, sign-up and reset: a frosted card beside a short, honest reason to have an account. */
export function AuthShell({ title, intro, points, children }: { title: string; intro?: React.ReactNode; points?: string[]; children: React.ReactNode }) {
  return (
    <div className="shell grid items-center gap-10 pt-12 sm:pt-16 lg:grid-cols-[1fr_minmax(0,460px)] lg:gap-16">
      <div className="rise hidden lg:block">
        <Mark size={52} />
        <h1 className="page-title mt-8 max-w-[14ch]">{title}</h1>
        {intro && <p className="dek mt-5 max-w-[44ch]">{intro}</p>}
        {points && (
          <ul className="sans mt-8 list-none space-y-3 p-0">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[.95rem] text-[var(--ink-soft)]">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--ok-soft)] text-[var(--ok)]"><Check size={12} strokeWidth={3} /></span>
                {p}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="glass-strong rise rise-1 rounded-[28px] p-6 sm:p-9">
        <div className="lg:hidden">
          <Mark size={40} />
          <h1 className="mt-5 text-[2rem] font-medium leading-tight tracking-[-.015em]">{title}</h1>
          {intro && <p className="mt-3 text-[1rem] text-[var(--ink-soft)]">{intro}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
