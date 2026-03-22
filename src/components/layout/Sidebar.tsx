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
        {/* Wordmark — mirrors the ARM Optics brand logo */}
        <div className="flex items-end leading-none select-none">
          {/* "arm" — heavy condensed, dominates like in the logo */}
          <span style={{
            fontFamily: "var(--font-barlow)",
            fontWeight: 900,
            fontSize: 33,
            lineHeight: 1,
            color: "#454545",
            letterSpacing: "-0.5px",
          }}>
            arm
          </span>

          {/* Red parallelogram slash — the brand accent */}
          <svg viewBox="0 0 14 28" fill="none"
            style={{ height: 24, width: "auto", flexShrink: 0, marginLeft: 6, marginRight: 6, marginBottom: 1 }}>
            <polygon points="5,0 13,0 9,28 1,28" fill="#d93226" />
          </svg>

          {/* "OPTICS" — light condensed, wide tracking */}
          <span style={{
            fontFamily: "var(--font-barlow)",
            fontWeight: 300,
            fontSize: 18,
            lineHeight: 1,
            color: "#636363",
            letterSpacing: "3px",
            textTransform: "uppercase",
            paddingBottom: 3,
          }}>
            optics
          </span>
        </div>

        {/* Subline */}
        <p style={{
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "#a0a0a0",
          marginTop: 7,
        }}>
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
