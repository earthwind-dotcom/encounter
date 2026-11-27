/**
 * Photographs used on the site: real places from the Gospel story, at first light. Every entry
 * names its photographer and license, and the credit is printed beside the photo. Files live in
 * /public/photos. A slot whose photo is missing falls back to the dawn gradient.
 */
export interface Photo {
  src: string;
  alt: string;
  place: string;
  credit: string;
  license: string;
  href: string;
  width: number;
  height: number;
}

export const PHOTOS: Partial<Record<'hero' | 'course' | 'questions' | 'lesson' | 'about' | 'invite', Photo>> = {};
