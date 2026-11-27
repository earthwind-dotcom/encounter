'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, ChevronDown, Headphones, ListTree, PlayCircle } from 'lucide-react';
import type { OutlineModule } from './types';

/**
 * The course outline beside a lesson: every module and lesson, what's done, where you are.
 * A sticky rail from 1024px up; a collapsible panel above the lesson on smaller screens.
 * Give it `key={currentId}` so it resets (current module open, phone panel shut) per lesson.
 */
export function CourseOutline({
  modules,
  currentId,
  labels,
}: {
  modules: OutlineModule[];
  currentId: string;
  labels: { outline: string; done: string; of: string; minutes: string; show: string; hide: string };
}) {
  const all = modules.flatMap((m) => m.lessons);
  const done = all.filter((l) => l.done).length;
  const pct = all.length ? Math.round((done / all.length) * 100) : 0;
  const currentModule = modules.find((m) => m.lessons.some((l) => l.id === currentId))?.id;
  const [open, setOpen] = useState<Set<string>>(() => new Set(currentModule ? [currentModule] : []));
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = (id: string) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <nav aria-label={labels.outline} className="glass lms-outline overflow-hidden !rounded-[22px]">
      <div className="flex items-center gap-3 border-b border-[var(--rule)] p-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <ListTree size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="kicker">{labels.outline}</p>
          <p className="sans mt-0.5 text-[.8rem] text-[var(--ink-soft)]">
            <strong className="font-semibold text-[var(--ink)]">{done}</strong> {labels.of} {all.length} {labels.done}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm lg:!hidden"
          aria-expanded={mobileOpen}
          aria-controls="lms-outline-list"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? labels.hide : labels.show}
          <ChevronDown size={14} className={`transition-transform ${mobileOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
      <div className="h-1 bg-[var(--glass-inner-2)]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={`${pct}%`}>
        <div className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--gold)] transition-[width] duration-700" style={{ width: `${pct}%` }} />
      </div>

      <div id="lms-outline-list" className={`${mobileOpen ? 'block' : 'hidden'} max-h-[calc(100dvh-220px)] overflow-y-auto overscroll-contain p-2 lg:block`}>
        {modules.map((m) => {
          const isOpen = open.has(m.id);
          const mDone = m.lessons.filter((l) => l.done).length;
          return (
            <section key={m.id} className="py-1">
              <button
                type="button"
                onClick={() => toggle(m.id)}
                aria-expanded={isOpen}
                className="sans flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-[var(--glass-inner-hover)]"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--gold)] text-[.74rem] font-semibold text-[var(--on-accent)]">
                  {m.badge}
                </span>
                <span className="min-w-0 flex-1 text-[.88rem] font-medium leading-snug text-[var(--ink)]">{m.title}</span>
                <span className={`mono text-[.68rem] ${mDone === m.lessons.length ? 'text-[var(--ok)]' : 'text-[var(--faint)]'}`}>
                  {mDone}/{m.lessons.length}
                </span>
                <ChevronDown size={14} className={`shrink-0 text-[var(--faint)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <ol className="relative m-0 mt-1 list-none p-0 pl-[22px]">
                  <span aria-hidden="true" className="absolute bottom-3 left-[22px] top-3 w-px bg-[var(--rule-strong)]" />
                  {m.lessons.map((l) => {
                    const current = l.id === currentId;
                    return (
                      <li key={l.id} className="relative">
                        <Link
                          href={l.href}
                          aria-current={current ? 'page' : undefined}
                          className={`group relative flex items-start gap-3 rounded-xl py-2 pl-5 pr-2 text-[.86rem] leading-snug transition-colors ${
                            current ? 'bg-[var(--accent-soft)] text-[var(--ink)]' : 'text-[var(--ink-soft)] hover:bg-[var(--glass-inner-hover)] hover:text-[var(--ink)]'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`absolute -left-[6px] top-[11px] grid h-[13px] w-[13px] place-items-center rounded-full border-2 ${
                              l.done
                                ? 'border-[var(--ok)] bg-[var(--ok)]'
                                : current
                                  ? 'border-[var(--accent)] bg-[var(--paper)] lms-pulse'
                                  : 'border-[var(--rule-strong)] bg-[var(--paper)]'
                            }`}
                          >
                            {l.done && <Check size={8} strokeWidth={4} className="text-[var(--paper)]" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={`sans block ${current ? 'font-medium' : ''}`}>
                              <span className="mono mr-1.5 text-[.7rem] text-[var(--faint)]">{String(l.n).padStart(2, '0')}</span>
                              {l.title}
                            </span>
                            {(l.minutes || l.media) && (
                              <span className={`mono mt-0.5 flex items-center gap-1.5 text-[.66rem] ${current ? 'text-[var(--ink-soft)]' : 'text-[var(--faint)]'}`}>
                                {l.media === 'video' && <PlayCircle size={11} />}
                                {l.media === 'audio' && <Headphones size={11} />}
                                {l.minutes ? `${l.minutes} ${labels.minutes}` : null}
                              </span>
                            )}
                          </span>
                          {l.done && <span className="sr-only">({labels.done})</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          );
        })}
      </div>
    </nav>
  );
}
