import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component - cookies can be read-only
          }
        },
      },
    }
  );
}

/**
 * Request-scoped cached getUser.
 *
 * auth.getUser() makes an HTTP round-trip to Supabase Auth to validate the JWT.
 * React.cache() deduplicates calls within a single render pass (layout + page + any
 * server components in the same request), so the network call happens exactly once
 * even when both the portal layout and portal page independently call getUser().
 */
export const getCachedUser = cache(async () => {
  const supabase = await createClient();
  return supabase.auth.getUser();
});
