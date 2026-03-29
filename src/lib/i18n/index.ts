/**
 * Shared i18n utilities — safe to import from both server and client components.
 */

import { en } from "./translations/en";
import { bg } from "./translations/bg";

export type Locale = "en" | "bg";
export const LOCALES: Locale[] = ["en", "bg"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "arm_locale";

export type Dictionary = typeof en;

/** Return the translation dictionary for the given locale. */
export function getDict(locale: Locale): Dictionary {
  return locale === "bg" ? bg : en;
}
