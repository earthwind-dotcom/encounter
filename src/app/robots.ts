import type { MetadataRoute } from 'next';

const BASE = process.env.SITE_URL ?? (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'http://localhost:3000');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/account', '/facilitate', '/signin', '/signup', '/api/'] },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
