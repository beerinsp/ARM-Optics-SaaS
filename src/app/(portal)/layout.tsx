import { redirect } from "next/navigation";
import { getCachedUser } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n";
import Link from "next/link";
import { Eye } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { PortalSignOut } from "./PortalSignOut";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: { user } } = await getCachedUser();

  if (!user) {
    redirect("/portal-login");
  }

  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.portal;
  const tn = dict.nav;

  return (
    <div className="min-h-screen bg-brand-50">
      {/* Portal Header */}
      <header className="bg-white border-b border-brand-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-900 font-display leading-none">ARM Optics</p>
              <p className="text-[10px] text-brand-400 tracking-widest uppercase">{t.customerPortalLabel}</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/portal" className="text-sm text-brand-500 hover:text-brand-800 transition-colors">
              {t.dashboardTitle}
            </Link>
            <Link href="/portal/orders" className="text-sm text-brand-500 hover:text-brand-800 transition-colors">
              {tn.portalOrders}
            </Link>
            <Link href="/portal/prescriptions" className="text-sm text-brand-500 hover:text-brand-800 transition-colors">
              {tn.portalPrescriptions}
            </Link>
            <LanguageSwitcher compact />
            <PortalSignOut label={t.signOut} />
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
