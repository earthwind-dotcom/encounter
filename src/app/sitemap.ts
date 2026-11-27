import type { MetadataRoute } from 'next';
import { getLibrary } from '@/lib/content';

const BASE = process.env.SITE_URL ?? (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'http://localhost:3000');

/** The public front door only: course sessions, full answers and the library need an account. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lib = getLibrary();
  const paths = ['/', '/questions', '/course', '/talk', '/privacy', ...lib.colophon.articles.map((a) => `/about/${a.slug}`)];
  return paths.map((p) => ({ url: `${BASE}${p}` }));
}
