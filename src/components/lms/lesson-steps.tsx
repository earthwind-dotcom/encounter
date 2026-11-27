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
  // While a tapped jump is scrolling, the tapped step stays lit instead of the lit step
  // walking through every section the page passes on the way.
  const jumping = useRef(false);

  useEffect(() => {
    const els = steps.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (jumping.current) return;
        const line = 170;
        let idx = 0;
        els.forEach((el, i) => {
          if (el.getBoundingClientRect().top - line <= 0) idx = i;
        });
        // A short last section can never reach the reading line: at the bottom, it's the one you're on.
        if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) idx = els.length - 1;
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

  // Keep the lit step in view when the row scrolls sideways on a phone. Scroll only the row:
  // scrollIntoView would also nudge the page vertically, which moves the reading line, which
  // changes the lit step, and the page jitters back and forth. No smooth scrolling here or in
  // jump(): iOS Safari spends a tap on stopping a scroll that is still animating, so the next
  // step you tap would be ignored and only every other tap would land.
  useEffect(() => {
    const row = rail.current;
    const el = row?.children[active] as HTMLElement | undefined;
    if (!row || !el) return;
    const left = el.offsetLeft - (row.clientWidth - el.offsetWidth) / 2;
    row.scrollTo({ left: Math.max(0, left), behavior: 'auto' });
  }, [active]);

  // Tapping a step: light it now, then jump its heading to just under this bar.
  const jump = (e: React.MouseEvent<HTMLAnchorElement>, i: number, id: string) => {
    const target = document.getElementById(id);
    const bar = rail.current;
    if (!target || !bar || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    setActive(i);
    jumping.current = true;
    // Measure where the bar sits once stuck, not where it is now (from the top of the page it hasn't stuck yet).
    const stuckTop = parseFloat(getComputedStyle(bar.parentElement ?? bar).top) || 0;
    const top = target.getBoundingClientRect().top + scrollY - (stuckTop + bar.offsetHeight + 16);
    let settle = 0;
    const done = () => {
      clearTimeout(settle);
      removeEventListener('scroll', wait);
      jumping.current = false;
    };
    // Release once the scroll has been still for a moment (works where scrollend doesn't).
    const wait = () => {
      clearTimeout(settle);
      settle = window.setTimeout(done, 140);
    };
    addEventListener('scroll', wait, { passive: true });
    wait();
    scrollTo({ top: Math.max(0, top), behavior: 'auto' });
    history.replaceState(null, '', `#${id}`);
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  };

  if (steps.length < 2) return null;
  return (
    <nav aria-label={label} className="no-print sticky top-[78px] z-20 -mx-1 lg:top-[88px]">
      <ol ref={rail} className="glass-strong scrollbar-none m-0 flex list-none gap-1 overflow-x-auto !rounded-full p-1.5">
        {steps.map((s, i) => (
          <li key={s.id} className="shrink-0">
            <a
              href={`#${s.id}`}
              onClick={(e) => jump(e, i, s.id)}
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
