'use client';

import { useId, useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';

export interface ReaderPassage {
  label: string;
  verses: { chapter: number; verse: number; text: string }[];
}

/**
 * The lesson's primary text, read in place. One tab per passage; long passages open folded with
 * a fade and a "read all" button. Verse numbers are small and skippable.
 */
export function PassageReader({ passages, labels, textLang = 'en' }: { passages: ReaderPassage[]; labels: { title: string; translation: string; readAll: string; fold: string; note?: string }; textLang?: string }) {
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const id = useId();
  if (!passages.length) return null;
  const p = passages[Math.min(tab, passages.length - 1)];
  const long = p.verses.length > 8;
  const multiChapter = p.verses.some((v) => v.chapter !== p.verses[0].chapter);

  return (
    <section className="glass passage !rounded-[24px]" aria-labelledby={`${id}-h`}>
      <header className="flex flex-wrap items-center gap-3 border-b border-[var(--rule)] px-5 py-4 sm:px-7">
        <BookOpen size={16} className="text-[var(--accent)]" />
        <h2 id={`${id}-h`} className="kicker kicker-accent m-0">{labels.title}</h2>
        <span className="sans ml-auto text-[.74rem] text-[var(--faint)]">{labels.translation}</span>
      </header>
      {passages.length > 1 && (
        <div role="tablist" aria-label={labels.title} className="scrollbar-none flex gap-1.5 overflow-x-auto px-5 pt-4 sm:px-7">
          {passages.map((x, i) => (
            <button
              key={x.label}
              role="tab"
              type="button"
              aria-selected={i === tab}
              aria-controls={`${id}-panel`}
              onClick={() => {
                setTab(i);
                setOpen(false);
              }}
              className={`sans shrink-0 rounded-full px-3 py-1.5 text-[.78rem] font-medium transition-colors ${i === tab ? 'bg-[var(--ink)] text-[var(--paper)]' : 'bg-[var(--glass-inner-2)] text-[var(--ink-soft)] hover:text-[var(--ink)]'}`}
            >
              {x.label}
            </button>
          ))}
        </div>
      )}
      <div id={`${id}-panel`} role={passages.length > 1 ? 'tabpanel' : undefined} className="px-5 pb-5 pt-4 sm:px-7 sm:pb-7">
        <p className="mb-3 text-[1.05rem] font-medium">{p.label}</p>
        <div className={`relative ${long && !open ? 'max-h-[260px] overflow-hidden' : ''}`}>
          <p lang={textLang} className="passage-text m-0 max-w-[var(--measure)] text-[1.08rem] leading-[1.85]">
            {p.verses.map((v, i) => (
              <span key={`${v.chapter}:${v.verse}`}>
                {multiChapter && (i === 0 || v.chapter !== p.verses[i - 1].chapter) && <span className="sans mr-1 text-[.8rem] font-semibold text-[var(--accent)]">{v.chapter}</span>}
                <sup className="sans mr-0.5 text-[.62rem] font-medium text-[var(--faint)]">{v.verse}</sup>
                {v.text}{' '}
              </span>
            ))}
          </p>
          {long && !open && <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--paper-2)] to-transparent" />}
        </div>
        {long && (
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="btn btn-ghost btn-sm mt-4">
            {open ? labels.fold : `${labels.readAll} (${p.verses.length})`} <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        )}
        {labels.note && <p className="sans mt-4 text-[.78rem] text-[var(--faint)]">{labels.note}</p>}
      </div>
    </section>
  );
}
