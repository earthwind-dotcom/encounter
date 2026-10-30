'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Chips that show one group of a list at a time. The groups are server-rendered with
 * `data-group`; with JavaScript off, every group simply stays visible.
 */
export function FilterChips({ options, allLabel, children }: { options: { id: string; label: string; count: number }[]; allLabel: string; children: React.ReactNode }) {
  const [active, setActive] = useState<string | null>(null);
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    list.current?.querySelectorAll<HTMLElement>('[data-group]').forEach((el) => {
      el.hidden = active !== null && el.dataset.group !== active;
    });
  }, [active]);
  const total = options.reduce((n, o) => n + o.count, 0);
  const chip = (id: string | null, label: string, count: number) => (
    <button
      key={id ?? 'all'}
      type="button"
      aria-pressed={active === id}
      onClick={() => setActive(id)}
      className={`sans inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-[.84rem] font-medium transition-all ${
        active === id
          ? 'border-transparent bg-[var(--ink)] text-[var(--paper)] shadow-[0_6px_18px_-8px_rgb(0_0_0/.4)]'
          : 'border-[var(--glass-border)] bg-[var(--glass)] text-[var(--ink-soft)] shadow-[var(--shadow-glass)] backdrop-blur-md hover:text-[var(--ink)]'
      }`}
    >
      {label}
      <span className={`text-[.72rem] ${active === id ? 'opacity-70' : 'text-[var(--faint)]'}`}>{count}</span>
    </button>
  );
  return (
    <>
      <div className="no-print mt-8 flex flex-wrap gap-2" role="group">
        {chip(null, allLabel, total)}
        {options.map((o) => chip(o.id, o.label, o.count))}
      </div>
      <div ref={list}>{children}</div>
    </>
  );
}
