'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const path = usePathname();
  return links.map((l) => {
    const current = path === l.href || path.startsWith(l.href + '/');
    return (
      <Link
        key={l.href}
        href={l.href}
        aria-current={current ? 'page' : undefined}
        className={`kicker whitespace-nowrap border-b-2 pb-3 hover:text-[var(--ink)] ${
          current ? 'border-[var(--accent)] text-[var(--ink)]' : 'border-transparent'
        }`}
      >
        {l.label}
      </Link>
    );
  });
}
