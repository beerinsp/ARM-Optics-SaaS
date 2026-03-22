"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Eye,
  Bell,
  Settings,
  LogOut,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/prescriptions", label: "Prescriptions", icon: Eye },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-dark-950/95 border-r border-white/[0.05] flex flex-col z-30 backdrop-blur-xl">
      {/* Logo */}
      <div className="p-6 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-lg shadow-gold/20">
            <Eye className="w-5 h-5 text-dark-950" />
          </div>
          <div>
            <p className="text-sm font-bold text-dark-100 font-display leading-none">
              ARM Optics
            </p>
            <p className="text-[10px] text-dark-400 mt-0.5 tracking-widest uppercase">
              CRM Platform
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group",
                active
                  ? "bg-gold/10 text-gold border border-gold/20"
                  : "text-dark-400 hover:text-dark-200 hover:bg-white/5"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0",
                  active ? "text-gold" : "text-dark-500 group-hover:text-dark-300"
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-white/[0.05]">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-400 hover:text-dark-200 hover:bg-white/5 transition-all w-full"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
