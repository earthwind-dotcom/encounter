import 'server-only';
import { cookies, headers } from 'next/headers';
import { LANG_COOKIE, isLang, type Lang } from './i18n';

/** The reader's language: their saved choice, else the browser's preference, else English. */
export async function getLang(): Promise<Lang> {
  const saved = (await cookies()).get(LANG_COOKIE)?.value;
  if (isLang(saved)) return saved;
  const accept = (await headers()).get('accept-language') ?? '';
  for (const part of accept.split(',')) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (isLang(code)) return code;
  }
  return 'en';
}
