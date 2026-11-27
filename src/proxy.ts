import { NextResponse, type NextRequest } from 'next/server';

/**
 * One public address. Once SITE_URL names the custom domain (encounter.understaffed.tech), anyone
 * arriving on the old *.up.railway.app address is sent there with a permanent redirect, path and
 * query kept. The health check stays reachable on any host so Railway's deploy checks still pass.
 */
export function proxy(request: NextRequest) {
  const site = process.env.SITE_URL;
  if (!site) return NextResponse.next();
  const target = new URL(site);
  const host = (request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '').split(',')[0].trim().toLowerCase();
  if (host.endsWith('.up.railway.app') && host !== target.host) {
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, target);
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/health|_next/static|_next/image).*)'],
};
