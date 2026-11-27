import 'server-only';
import { getDb } from './db';

/** The days (YYYY-MM-DD) a person checked in a practice, newest first, over the last ~6 weeks. */
export async function practiceDays(userId: number): Promise<string[]> {
  const rows = await (await getDb()).query<{ day: string | Date }>(
    `SELECT day FROM practice_log WHERE user_id = $1 AND day > CURRENT_DATE - 45 ORDER BY day DESC`,
    [userId],
  );
  return rows.map((r) => (typeof r.day === 'string' ? r.day.slice(0, 10) : r.day.toISOString().slice(0, 10)));
}
