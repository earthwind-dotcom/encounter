'use client';

import { useEffect, useRef, useState } from 'react';
import type { LessonStep } from './types';

/**
 * The lesson's sections as a row of steps that sticks under the header. The step you're
 * reading is lit and the ones behind it are filled, so you always know how far through you are.
 */
export function LessonSteps({ steps, label }: { steps: LessonStep[]; label: string }) {
  const [active, setActive] = useState(0);
  const rail = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const els = steps.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const line = 170;
        let idx = 0;
        els.forEach((el, i) => {
          if (el.getBoundingClientRect().top - line <= 0) idx = i;
        });
        setActive(idx);
      });
    };
    update();
    addEventListener('scroll', update, { passive: true });
    return () => {
      removeEventListener('scroll', update);
      cancelAnimationFrame(raf);
    };
  }, [steps]);

  // Keep the lit step in view when the row scrolls sideways on a phone.
  useEffect(() => {
    const el = rail.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [active]);

  if (steps.length < 2) return null;
  return (
    <nav aria-label={label} className="no-print sticky top-[78px] z-20 -mx-1 lg:top-[88px]">
      <ol ref={rail} className="glass-strong scrollbar-none m-0 flex list-none gap-1 overflow-x-auto !rounded-full p-1.5">
        {steps.map((s, i) => (
          <li key={s.id} className="shrink-0">
            <a
              href={`#${s.id}`}
              aria-current={i === active ? 'step' : undefined}
              className={`sans flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-[.78rem] font-medium transition-colors duration-300 ${
                i === active
                  ? 'bg-[var(--accent)] text-[var(--on-accent)] shadow-[0_6px_16px_-8px_var(--accent-glow)]'
                  : i < active
                    ? 'text-[var(--ink)] hover:bg-[var(--glass-inner-hover)]'
                    : 'text-[var(--faint)] hover:bg-[var(--glass-inner-hover)] hover:text-[var(--ink)]'
              }`}
            >
              <span
                aria-hidden="true"
                className={`mono grid h-[18px] w-[18px] place-items-center rounded-full text-[.6rem] ${
                  i === active ? 'bg-[var(--on-accent)]/20' : i < active ? 'bg-[var(--ok-soft)] text-[var(--ok)]' : 'bg-[var(--glass-inner-2)]'
                }`}
              >
                {i + 1}
              </span>
              {s.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
