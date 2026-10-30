'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const isCurrent = (path: string, href: string) => path === href || path.startsWith(href + '/');

/** The main sections as pills; the one you're in sits on a raised glass chip. */
export function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const path = usePathname();
  return links.map((l) => {
    const current = isCurrent(path, l.href);
    return (
      <Link
        key={l.href}
        href={l.href}
        aria-current={current ? 'page' : undefined}
        className={`sans whitespace-nowrap rounded-full px-3 py-1.5 text-[.88rem] font-medium transition-colors ${
          current
            ? 'bg-[var(--glass-strong)] text-[var(--ink)] shadow-[var(--shadow-glass)]'
            : 'text-[var(--ink-soft)] hover:bg-[var(--glass-inner-hover)] hover:text-[var(--ink)]'
        }`}
      >
        {l.label}
      </Link>
    );
  });
}
