import { redirect } from "next/navigation";
import { createClient, getCachedUser } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // getCachedUser() is request-scoped via React.cache(). Any page component in this
  // render pass that also calls getCachedUser() gets the cached result — one
  // Supabase Auth HTTP request instead of two per navigation.
  // createClient() is cheap (cookie read + object construction) so run in parallel.
  const [{ data: { user } }, supabase] = await Promise.all([
    getCachedUser(),
    createClient(),
  ]);

  if (!user) {
    redirect("/login");
  }

  // Verify staff profile exists and is active.
  const { data: staffProfile } = await supabase
    .from("staff_profiles")
    .select("id, role, is_active")
    .eq("id", user.id)
    .single();

  if (!staffProfile || !staffProfile.is_active) {
    await supabase.auth.signOut({ scope: "local" });
    redirect("/login?error=not_staff");
  }

  return (
    <div className="min-h-screen bg-brand-50 flex">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
