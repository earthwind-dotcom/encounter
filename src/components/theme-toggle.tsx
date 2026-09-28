'use client';

/** Cycles light → dark → system. The choice lives in this browser only (a per-viewer convenience). */
export function ThemeToggle({ label }: { label: string }) {
  const cycle = () => {
    const root = document.documentElement;
    const now = root.dataset.theme;
    const next = now === 'light' ? 'dark' : now === 'dark' ? undefined : matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark';
    if (next) root.dataset.theme = next;
    else delete root.dataset.theme;
    try {
      if (next) localStorage.setItem('enc-theme', next);
      else localStorage.removeItem('enc-theme');
    } catch {}
  };
  return (
    <button type="button" onClick={cycle} aria-label={label} title={label} className="kicker border border-[var(--rule)] rounded-sm px-2 py-1 hover:text-[var(--ink)] cursor-pointer">
      ◐
    </button>
  );
}
