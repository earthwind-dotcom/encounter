'use client';

import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

type Mode = 'light' | 'dark' | 'system';

/** Cycles light → dark → system. The choice lives in this browser only (a per-viewer convenience). */
export function ThemeToggle({ label }: { label: string }) {
  const [mode, setMode] = useState<Mode>('system');
  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    // Reads the theme the inline head script already applied; there is no server value to match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(t === 'light' || t === 'dark' ? t : 'system');
  }, []);

  const cycle = () => {
    const root = document.documentElement;
    const next: Mode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    if (next === 'system') delete root.dataset.theme;
    else root.dataset.theme = next;
    try {
      if (next === 'system') localStorage.removeItem('enc-theme');
      else localStorage.setItem('enc-theme', next);
    } catch {}
    setMode(next);
  };
  const Icon = mode === 'light' ? Sun : mode === 'dark' ? Moon : Monitor;
  return (
    <button type="button" onClick={cycle} aria-label={`${label}: ${mode}`} title={`${label}: ${mode}`} className="icon-btn">
      <Icon size={17} />
    </button>
  );
}
