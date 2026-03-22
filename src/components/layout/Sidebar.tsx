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
      <div className="px-5 py-4 border-b border-brand-100">
        <div className="flex items-end gap-1.5 leading-none">
          <span
            className="text-[28px] tracking-tight text-brand-600"
            style={{ fontFamily: "var(--font-barlow)", fontWeight: 900, lineHeight: 1 }}
          >
            arm
          </span>
          <svg viewBox="0 0 9 20" style={{ height: 17, width: "auto", flexShrink: 0, marginBottom: 2 }} fill="none">
            <polygon points="0,18 7,0 9,1 2,19" fill="#d93226" />
          </svg>
          <span
            className="text-[16px] tracking-[0.18em] text-brand-500 uppercase"
            style={{ fontFamily: "var(--font-barlow)", fontWeight: 300, lineHeight: 1, marginBottom: 2 }}
          >
            Optics
          </span>
        </div>
        <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-brand-400 mt-1.5">
          CRM Platform
        </p>
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
