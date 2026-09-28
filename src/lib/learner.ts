import 'server-only';
import { getDb } from './db';
import { getCurrentUser } from './session';
import { t, type Lang } from './i18n';

/** Everything a page needs to render LearnerTools for one item. */
export async function learnerState(itemKey: string, lang: Lang) {
  const user = await getCurrentUser();
  let done = false;
  let note = '';
  if (user) {
    const db = await getDb();
    const [p, n] = await Promise.all([
      db.query('SELECT 1 FROM progress WHERE user_id = $1 AND item_key = $2', [user.id, itemKey]),
      db.query<{ body: string }>('SELECT body FROM notes WHERE user_id = $1 AND item_key = $2', [user.id, itemKey]),
    ]);
    done = p.length > 0;
    note = n[0]?.body ?? '';
  }
  return {
    itemKey,
    signedIn: !!user,
    initialDone: done,
    initialNote: note,
    labels: {
      markDone: t('markDone', lang),
      done: t('done', lang),
      signInToTrack: t('signInToTrack', lang),
      yourNotes: t('yourNotes', lang),
      notesHint: t('notesHint', lang),
      save: t('save', lang),
      saved: t('saved', lang),
    },
  };
}

export async function completedKeys(userId: number): Promise<Set<string>> {
  const rows = await (await getDb()).query<{ item_key: string }>('SELECT item_key FROM progress WHERE user_id = $1', [userId]);
  return new Set(rows.map((r) => r.item_key));
}
