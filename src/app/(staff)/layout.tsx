import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify staff profile exists
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
