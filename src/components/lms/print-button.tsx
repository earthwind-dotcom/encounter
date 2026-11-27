'use client';

import { Printer } from 'lucide-react';

/** Prints the lesson as a handout (the print stylesheet strips the chrome). */
export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => print()} className="sans inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[.82rem] text-[var(--faint)] transition-colors hover:bg-[var(--glass-inner-hover)] hover:text-[var(--accent)]">
      <Printer size={14} /> {label}
    </button>
  );
}
