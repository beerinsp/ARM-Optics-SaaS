import { createClient, getCachedUser } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/lib/utils";
import type { StaffProfile } from "@/types/database";

export default async function SettingsPage() {
  const [{ data: { user } }, supabase, locale] = await Promise.all([
    getCachedUser(),
    createClient(),
    getLocale(),
  ]);
  const dict = getDict(locale);
  const t = dict.settings;

  // Both profile queries are independent — run in parallel.
  const [{ data: profile }, { data: allStaff }] = await Promise.all([
    supabase.from("staff_profiles").select("*").eq("id", user?.id ?? "").single(),
    supabase.from("staff_profiles").select("*").order("full_name"),
  ]);

  const isAdmin = profile?.role === "admin";

  return (
    <div>
      <PageHeader title={t.title} description={t.description} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Profile */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-brand-800 mb-4 pb-2 border-b border-brand-100">
            {t.myProfile}
          </h3>
          {profile && (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-brand-400">{t.fullName}</p>
                <p className="text-brand-800">{profile.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-brand-400">{t.email}</p>
                <p className="text-brand-800">{profile.email}</p>
              </div>
              <div>
                <p className="text-xs text-brand-400">{t.role}</p>
                <p className="text-brand-800">{dict.enums.staffRole[profile.role as keyof typeof dict.enums.staffRole] ?? profile.role}</p>
              </div>
              <div>
                <p className="text-xs text-brand-400">{t.memberSince}</p>
                <p className="text-brand-800">{formatDate(profile.created_at)}</p>
              </div>
            </div>
          )}
        </div>

        {/* GenSoft Integration */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-brand-800 mb-4 pb-2 border-b border-brand-100">
            {t.gensoftTitle}
          </h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-brand-50 rounded-lg border border-brand-100">
              <p className="text-brand-700 text-xs mb-2">{t.integrationStatus}</p>
              <p className="text-brand-500 text-xs">
                {t.integrationDescription}
              </p>
              <div className="mt-2 space-y-1 font-mono text-xs">
                <p className="text-brand-400">GENSOFT_API_URL</p>
                <p className="text-brand-400">GENSOFT_API_USER</p>
                <p className="text-brand-400">GENSOFT_API_PASSWORD</p>
              </div>
            </div>
            <p className="text-xs text-brand-400">
              {t.gensoftAutoSync}
            </p>
          </div>
        </div>

        {/* Staff Management (admin only) */}
        {isAdmin && (
          <div className="lg:col-span-2 card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-brand-100">
              <h3 className="text-sm font-semibold text-brand-800">{t.staffMembers}</h3>
              <p className="text-xs text-brand-400">
                {t.addStaffDescription}
              </p>
            </div>
            <div className="divide-y divide-brand-100">
              {(allStaff as StaffProfile[] ?? []).map((staff) => (
                <div key={staff.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-brand-900">{staff.full_name}</p>
                    <p className="text-xs text-brand-500">{staff.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs border border-brand-200 bg-white/5 text-brand-700 px-2 py-0.5 rounded-full">
                      {dict.enums.staffRole[staff.role as keyof typeof dict.enums.staffRole] ?? staff.role}
                    </span>
                    <span className={`text-xs ${staff.is_active ? "text-green-400" : "text-red-400"}`}>
                      {staff.is_active ? dict.common.active : dict.common.inactive}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email Configuration */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-brand-800 mb-4 pb-2 border-b border-brand-100">
            {t.emailConfig}
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-brand-500 text-xs">
              {t.emailConfigDescription}
            </p>
            <div className="mt-2 space-y-1 font-mono text-xs">
              <p className="text-brand-400">RESEND_API_KEY</p>
              <p className="text-brand-400">EMAIL_FROM</p>
            </div>
            <p className="text-xs text-brand-400 mt-2">
              {t.emailSupports}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
