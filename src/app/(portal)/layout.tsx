import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Eye, LogOut } from "lucide-react";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal-login");
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Portal Header */}
      <header className="bg-dark-950/95 border-b border-white/[0.05] backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
              <Eye className="w-4 h-4 text-dark-950" />
            </div>
            <div>
              <p className="text-sm font-bold text-dark-100 font-display leading-none">ARM Optics</p>
              <p className="text-[10px] text-dark-500 tracking-widest uppercase">Customer Portal</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/portal" className="text-sm text-dark-400 hover:text-dark-200 transition-colors">
              Dashboard
            </Link>
            <Link href="/portal/orders" className="text-sm text-dark-400 hover:text-dark-200 transition-colors">
              Orders
            </Link>
            <Link href="/portal/prescriptions" className="text-sm text-dark-400 hover:text-dark-200 transition-colors">
              Prescriptions
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button className="flex items-center gap-1 text-xs text-dark-500 hover:text-dark-300 transition-colors">
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
