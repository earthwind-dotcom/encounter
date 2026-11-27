import Image from 'next/image';
import type { Photo } from '@/lib/photos';

/**
 * A photograph in a rounded frame, with its credit. Without a photo it shows the dawn light
 * instead, so a slot never looks broken.
 */
export function PhotoFrame({
  photo,
  className = '',
  priority = false,
  sizes = '100vw',
  position = '50% 50%',
  inLink = false,
  children,
}: {
  photo?: Photo;
  className?: string;
  priority?: boolean;
  sizes?: string;
  /** object-position, to keep the subject in a tight crop. */
  position?: string;
  /** Inside a link already: print the credit as text, since links can't nest. */
  inLink?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <figure className={`photo-frame relative m-0 overflow-hidden ${className}`}>
      {photo ? (
        <Image src={photo.src} alt={photo.alt} fill priority={priority} sizes={sizes} className="photo-img object-cover" style={{ objectPosition: position }} />
      ) : (
        <div aria-hidden="true" className="photo-fallback absolute inset-0" />
      )}
      <div aria-hidden="true" className="photo-scrim absolute inset-0" />
      {children}
      {photo && (
        <figcaption className="sans absolute right-4 top-3 z-[2] rounded-full bg-black/25 px-2 py-0.5 text-[.62rem] text-white/90 backdrop-blur-sm">
          {photo.place} ·{' '}
          {inLink ? photo.credit : <a href={photo.href} className="text-white/90 underline-offset-2 hover:text-white" rel="noopener">{photo.credit}</a>}, {photo.license}
        </figcaption>
      )}
    </figure>
  );
}
