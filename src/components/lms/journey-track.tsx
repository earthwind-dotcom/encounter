import Link from 'next/link';
import { Check } from 'lucide-react';
import type { OutlineModule } from './types';

/**
 * The whole course as one path: a node per lesson, grouped by module, filled as you go, with
 * the next lesson glowing. One row on wide screens; one row per module on phones.
 */
export function JourneyTrack({ modules, nextId, label }: { modules: OutlineModule[]; nextId?: string; label: string }) {
  return (
    <nav aria-label={label} className="journey">
      <ol className="m-0 grid list-none gap-5 p-0 md:flex md:gap-0">
        {modules.map((m, mi) => {
          const doneCount = m.lessons.filter((l) => l.done).length;
          return (
            <li key={m.id} className="journey-module min-w-0 md:flex-[var(--n)]" style={{ ['--n' as string]: m.lessons.length }}>
              <p className="sans mb-3 flex items-baseline gap-2 pr-4 text-[.74rem] font-medium uppercase tracking-[.12em] text-[var(--faint)]">
                <span className="text-[var(--accent)]">{m.badge}</span>
                <span className="truncate normal-case tracking-normal text-[.86rem] text-[var(--ink-soft)]">{m.title}</span>
                <span className="mono ml-auto text-[.66rem] md:hidden">{doneCount}/{m.lessons.length}</span>
              </p>
              <ol className="relative m-0 flex list-none items-center p-0">
                {m.lessons.map((l, i) => {
                  const isNext = l.id === nextId;
                  const lastOverall = mi === modules.length - 1 && i === m.lessons.length - 1;
                  return (
                    <li key={l.id} className="relative flex flex-1 items-center">
                      <Link
                        href={l.href}
                        aria-label={`${String(l.n).padStart(2, '0')} ${l.title}`}
                        title={l.title}
                        className={`journey-node group relative z-[1] grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 text-[.8rem] font-semibold transition-transform duration-300 hover:scale-110 focus-visible:scale-110 ${
                          l.done
                            ? 'border-transparent bg-[var(--ok)] text-[var(--paper)]'
                            : isNext
                              ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)] journey-next'
                              : 'border-[var(--rule-strong)] bg-[var(--glass-strong)] text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                        }`}
                      >
                        <span className="sans">{l.done ? <Check size={16} strokeWidth={3} /> : String(l.n).padStart(2, '0')}</span>
                        <span role="tooltip" className="journey-tip sans pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 w-max max-w-[220px] -translate-x-1/2 rounded-xl bg-[var(--ink)] px-3 py-2 text-center text-[.76rem] font-medium leading-snug text-[var(--paper)] opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                          {l.title}
                        </span>
                      </Link>
                      {!lastOverall && (
                        <span aria-hidden="true" className={`h-[3px] flex-1 rounded-full ${l.done ? 'bg-[var(--ok)]' : 'bg-[var(--rule-strong)]'} ${i === m.lessons.length - 1 ? 'hidden md:block' : ''}`} />
                      )}
                    </li>
                  );
                })}
              </ol>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
