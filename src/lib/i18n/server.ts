/**
 * Server-only i18n helpers — uses next/headers (cookies).
 * Import only from Server Components, Server Actions, and Route Handlers.
 */

import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE } from "./index";
import type { Locale } from "./index";

/** Read the current locale from cookie (server components only). */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  if (value === "en" || value === "bg") return value;
  return DEFAULT_LOCALE;
}
