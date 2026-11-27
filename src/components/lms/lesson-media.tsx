'use client';

import { useEffect, useRef, useState } from 'react';
import { Gauge, Headphones } from 'lucide-react';

const RATES = [1, 1.25, 1.5, 1.75, 2, 0.75];

/**
 * A lesson's talk, video or audio. Native controls (keyboard, captions, picture in picture,
 * AirPlay all come free), plus the two things a course needs: it resumes where you stopped,
 * and it reports when you've watched most of it so the page can offer "mark complete".
 */
export function LessonMedia({
  kind,
  src,
  poster,
  captions,
  captionsLang = 'en',
  title,
  labels,
  onMostlyDone,
}: {
  kind: 'video' | 'audio';
  src: string;
  poster?: string;
  captions?: string;
  captionsLang?: string;
  title: string;
  labels: { speed: string; resumed: string; captions: string; listen: string };
  onMostlyDone?: () => void;
}) {
  const ref = useRef<HTMLVideoElement & HTMLAudioElement>(null);
  const [rate, setRate] = useState(1);
  const [resumed, setResumed] = useState(false);
  const key = `lms:pos:${src}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let fired = false;
    const restore = () => {
      const saved = Number(localStorage.getItem(key) || 0);
      if (saved > 5 && el.duration && saved < el.duration - 10) {
        el.currentTime = saved;
        setResumed(true);
      }
    };
    let last = 0;
    const tick = () => {
      if (Math.abs(el.currentTime - last) > 4) {
        last = el.currentTime;
        localStorage.setItem(key, String(Math.floor(el.currentTime)));
      }
      if (!fired && el.duration && el.currentTime / el.duration > 0.9) {
        fired = true;
        onMostlyDone?.();
      }
    };
    const ended = () => localStorage.removeItem(key);
    el.addEventListener('loadedmetadata', restore);
    el.addEventListener('timeupdate', tick);
    el.addEventListener('ended', ended);
    if (el.readyState >= 1) restore();
    return () => {
      el.removeEventListener('loadedmetadata', restore);
      el.removeEventListener('timeupdate', tick);
      el.removeEventListener('ended', ended);
    };
  }, [key, onMostlyDone]);

  const cycle = () => {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    setRate(next);
    if (ref.current) ref.current.playbackRate = next;
  };

  const track = captions ? <track kind="captions" src={captions} srcLang={captionsLang} label={labels.captions} default /> : null;

  return (
    <figure className="glass-strong no-print m-0 overflow-hidden !rounded-[24px]">
      {kind === 'video' ? (
        <div className="relative aspect-video bg-black">
          <video ref={ref} className="h-full w-full" controls preload="metadata" playsInline poster={poster} aria-label={title}>
            <source src={src} />
            {track}
          </video>
        </div>
      ) : (
        <div className="flex items-center gap-4 p-5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--gold)] text-[var(--on-accent)]">
            <Headphones size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="kicker">{labels.listen}</p>
            <audio ref={ref} className="mt-2 w-full" controls preload="metadata" aria-label={title}>
              <source src={src} />
              {track}
            </audio>
          </div>
        </div>
      )}
      <figcaption className="sans flex flex-wrap items-center gap-3 border-t border-[var(--rule)] px-5 py-3 text-[.8rem] text-[var(--ink-soft)]">
        <span className="min-w-0 flex-1 truncate">{title}</span>
        {resumed && <span className="pill pill-accent">{labels.resumed}</span>}
        <button type="button" onClick={cycle} className="btn btn-ghost btn-sm" aria-label={`${labels.speed}: ${rate}×`}>
          <Gauge size={14} /> {rate}×
        </button>
      </figcaption>
    </figure>
  );
}
