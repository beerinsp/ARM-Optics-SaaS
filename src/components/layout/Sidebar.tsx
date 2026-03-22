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
import { useLocale } from "@/lib/i18n/context";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { dict } = useLocale();

  const navItems = [
    { href: "/dashboard",     label: dict.nav.dashboard,     icon: LayoutDashboard },
    { href: "/customers",     label: dict.nav.customers,     icon: Users },
    { href: "/orders",        label: dict.nav.orders,        icon: ShoppingBag },
    { href: "/prescriptions", label: dict.nav.prescriptions, icon: Eye },
    { href: "/inventory",     label: dict.nav.inventory,     icon: Package },
    { href: "/reminders",     label: dict.nav.reminders,     icon: Bell },
    { href: "/settings",      label: dict.nav.settings,      icon: Settings },
  ];

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "local" });
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-brand-100 flex flex-col z-30">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-brand-100">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 flex-shrink-0">
            <div className="w-8 h-8 rounded bg-brand-900 flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-accent rounded-sm" />
          </div>

          <div className="leading-none">
            <div className="flex items-baseline gap-1">
              <span className="text-[13px] font-extrabold tracking-tight text-brand-900 uppercase">
                ARM
              </span>
              <span className="text-[13px] font-light tracking-widest text-brand-600 uppercase">
                Optics
              </span>
            </div>
            <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-brand-400 mt-0.5">
              CRM Platform
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-4 pb-2 space-y-0.5 overflow-y-auto">
        <p className="section-label px-3 mb-2">{dict.common.menu}</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group",
                active
                  ? "bg-brand-900 text-white"
                  : "text-brand-500 hover:text-brand-900 hover:bg-brand-50"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  active
                    ? "text-white"
                    : "text-brand-400 group-hover:text-brand-700"
                )}
              />
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Language Switcher */}
      <div className="px-4 pb-2 pt-1">
        <LanguageSwitcher />
      </div>

      {/* Sign Out */}
      <div className="px-3 py-3 border-t border-brand-100">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-brand-400 hover:text-brand-900 hover:bg-brand-50 transition-all w-full"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {dict.nav.signOut}
        </button>
      </div>
    </aside>
  );
}
