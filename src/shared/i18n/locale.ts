import 'server-only';

import { DEFAULT_LOCALE, Locale } from './config';

export async function getUserLocale(): Promise<Locale> {
  return DEFAULT_LOCALE;
}
