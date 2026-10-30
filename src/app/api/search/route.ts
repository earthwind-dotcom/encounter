import type { NextRequest } from 'next/server';
import { getLang } from '@/lib/lang';
import { search } from '@/lib/search';

/** Quick search for the ⌘K palette: the top hits, in the reader's language. */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').slice(0, 120);
  const lang = await getLang();
  const hits = q ? search(q, lang, 8).map(({ href, section, title, snippet }) => ({ href, section, title, snippet })) : [];
  return Response.json({ hits }, { headers: { 'Cache-Control': 'private, max-age=60' } });
}
