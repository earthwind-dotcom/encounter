import type { MetadataRoute } from 'next';
import { getLibrary, getQuestions, getSessions } from '@/lib/content';

const BASE = process.env.SITE_URL ?? (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'http://localhost:3000');

export default function sitemap(): MetadataRoute.Sitemap {
  const lib = getLibrary();
  const paths = [
    '/',
    '/questions',
    '/course',
    '/library',
    '/talk',
    '/privacy',
    ...getQuestions('en').map((q) => `/questions/${q.slug}`),
    ...getSessions().map((s) => `/course/${s.n}`),
    ...lib.encounter.articles.map((a) => `/course/pathway/${a.slug}`),
    ...(['reflections', 'roots', 'provenance'] as const).flatMap((s) => lib[s].articles.map((a) => `/library/${s}/${a.slug}`)),
    ...lib.colophon.articles.map((a) => `/about/${a.slug}`),
  ];
  return paths.map((p) => ({ url: `${BASE}${p}` }));
}
