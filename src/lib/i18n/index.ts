/**
 * i18n foundation — cookie-based locale, no URL prefix.
 *
 * Strategy: The locale is stored in a cookie (`arm_locale`).
 * - Server components call `getLocale()` (reads cookies via next/headers).
 * - Client components use `useLocale()` from the LocaleProvider context.
 * - Language switching writes the cookie client-side and calls router.refresh().
 * - No URL changes, no redirect logic needed — fully transparent.
 */

import { cookies } from "next/headers";
import { en } from "./translations/en";
import { bg } from "./translations/bg";

export type Locale = "en" | "bg";
export const LOCALES: Locale[] = ["en", "bg"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "arm_locale";

/** Read the current locale from cookie (server components only). */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  if (value === "en" || value === "bg") return value;
  return DEFAULT_LOCALE;
}

export type Dictionary = typeof en;

/** Return the translation dictionary for the given locale. */
export function getDict(locale: Locale): Dictionary {
  return locale === "bg" ? bg : en;
}
