import Image from 'next/image';
import type { Photo } from '@/lib/photos';

/**
 * A photograph in a rounded frame, with its credit. Without a photo it shows the dawn light
 * instead, so a slot never looks broken.
 */
export function PhotoFrame({ photo, className = '', priority = false, sizes = '100vw', children }: { photo?: Photo; className?: string; priority?: boolean; sizes?: string; children?: React.ReactNode }) {
  return (
    <figure className={`photo-frame relative m-0 overflow-hidden ${className}`}>
      {photo ? (
        <Image src={photo.src} alt={photo.alt} fill priority={priority} sizes={sizes} className="photo-img object-cover" />
      ) : (
        <div aria-hidden="true" className="photo-fallback absolute inset-0" />
      )}
      <div aria-hidden="true" className="photo-scrim absolute inset-0" />
      {children}
      {photo && (
        <figcaption className="sans absolute bottom-2 right-3 z-[2] text-[.64rem] text-white/80 [text-shadow:0_1px_2px_rgb(0_0_0/.6)]">
          {photo.place} · <a href={photo.href} className="text-white/80 underline-offset-2 hover:text-white" rel="noopener">{photo.credit}</a>, {photo.license}
        </figcaption>
      )}
    </figure>
  );
}
