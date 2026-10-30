'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRight, Menu, MessageCircle, X } from 'lucide-react';
import { isCurrent } from './nav-links';

/** Phone navigation: a glass sheet from the top, as a native <dialog>. Closes on navigation. */
export function MobileMenu({
  links,
  talk,
  account,
  label,
  children,
}: {
  links: { href: string; label: string }[];
  talk: { href: string; label: string };
  account: { href: string; label: string };
  label: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const path = usePathname();
  useEffect(() => ref.current?.close(), [path]);

  return (
    <>
      <button type="button" className="icon-btn lg:hidden" aria-label={label} onClick={() => ref.current?.showModal()}>
        <Menu size={19} />
      </button>
      <dialog
        ref={ref}
        aria-label={label}
        onClick={(e) => e.target === ref.current && ref.current?.close()}
        className="glass-strong m-0 mx-auto mt-3 w-[calc(100vw-24px)] max-w-none rounded-[24px] p-0"
      >
        <div className="flex items-center justify-between px-5 pt-4">
          <span className="mono text-[.74rem] font-medium tracking-[.3em] uppercase">Encounter</span>
          <button type="button" className="icon-btn" aria-label="Close" onClick={() => ref.current?.close()}>
            <X size={19} />
          </button>
        </div>
        <nav className="px-3 pb-2 pt-1" aria-label="Main">
          {[...links, account].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isCurrent(path, l.href) ? 'page' : undefined}
              className={`sans flex items-center justify-between rounded-2xl px-4 py-3.5 text-[1.05rem] font-medium ${
                isCurrent(path, l.href) ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--ink)]'
              }`}
            >
              {l.label}
              <ChevronRight size={17} className="text-[var(--faint)]" />
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-between gap-3 border-t border-[var(--rule)] px-5 py-4">{children}</div>
        <div className="px-5 pb-5">
          <Link href={talk.href} className="btn w-full">
            <MessageCircle size={16} /> {talk.label}
          </Link>
        </div>
      </dialog>
    </>
  );
}
