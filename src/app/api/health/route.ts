import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** Railway's health check: the app is up and the database answers. */
export async function GET() {
  try {
    await (await getDb()).query('SELECT 1');
    return Response.json({ ok: true });
  } catch (err) {
    console.error('health check failed:', err);
    return Response.json({ ok: false }, { status: 503 });
  }
}
