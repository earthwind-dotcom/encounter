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

const BY2 = 'CC BY 2.0';
const BYSA3 = 'CC BY-SA 3.0';
const BYSA4 = 'CC BY-SA 4.0';

/** All from Wikimedia Commons; resized only (no other edits). Checked by eye 2026-11-27: no faces, no watermarks. */
export const PHOTOS: Partial<Record<'hero' | 'course' | 'questions' | 'questionsPage' | 'about' | 'invite', Photo>> = {
  hero: {
    src: '/photos/galilee-dawn.jpg',
    alt: 'The sun rising over the Sea of Galilee, a lone fishing boat on the water',
    place: 'Sea of Galilee',
    credit: 'Grant Barclay',
    license: BY2,
    href: 'https://commons.wikimedia.org/wiki/File:Israel_Sunrise_over_Sea_of_Galilee_(16037234180).jpg',
    width: 2400,
    height: 1290,
  },
  invite: {
    src: '/photos/tiberias-dawn.jpg',
    alt: 'Soft first light over the Sea of Galilee from Tiberias, a boat resting on still water',
    place: 'Tiberias',
    credit: 'Grant Barclay',
    license: BY2,
    href: 'https://commons.wikimedia.org/wiki/File:Israel_Sunrise_over_Sea_of_Galilee_from_Scots_Hotel,_Tiberias_(15604871533).jpg',
    width: 2400,
    height: 1329,
  },
  questions: {
    src: '/photos/arbel-sunrise.jpg',
    alt: 'Sunrise over the Sea of Galilee from the rocky top of Mount Arbel',
    place: 'Mount Arbel',
    credit: 'Gal Ekrony',
    license: BYSA4,
    href: 'https://commons.wikimedia.org/wiki/File:%D7%96%D7%A8%D7%99%D7%97%D7%94_%D7%91%D7%94%D7%A8_%D7%90%D7%A8%D7%91%D7%9C.jpg',
    width: 2000,
    height: 1333,
  },
  course: {
    src: '/photos/arbel-sun.jpg',
    alt: 'The sun just above the Sea of Galilee, seen from the Arbel lookout',
    place: 'Mount Arbel',
    credit: 'Gal Ekrony',
    license: BYSA4,
    href: 'https://commons.wikimedia.org/wiki/File:%D7%96%D7%A8%D7%99%D7%97%D7%94_%D7%9E%D7%9E%D7%A6%D7%A4%D7%94_%D7%90%D7%A8%D7%91%D7%9C.jpg',
    width: 2000,
    height: 1333,
  },
  questionsPage: {
    src: '/photos/wadi-qelt.jpg',
    alt: 'A bare limestone canyon in the Judean wilderness, Wadi Qelt',
    place: 'Wadi Qelt, Judean wilderness',
    credit: 'Hardscarf',
    license: BYSA4,
    href: 'https://commons.wikimedia.org/wiki/File:Wadi_Qelt_-_canyon.jpg',
    width: 2000,
    height: 1333,
  },
  about: {
    src: '/photos/jerusalem-walls.jpg',
    alt: 'The Old City walls of Jerusalem in early light, near the Tower of David',
    place: 'Jerusalem',
    credit: 'Pninama',
    license: BYSA3,
    href: 'https://commons.wikimedia.org/wiki/File:%D7%97%D7%95%D7%9E%D7%AA_%D7%94%D7%A2%D7%99%D7%A8_%D7%94%D7%A2%D7%AA%D7%99%D7%A7%D7%94,_%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D.jpg',
    width: 2000,
    height: 1278,
  },
};
