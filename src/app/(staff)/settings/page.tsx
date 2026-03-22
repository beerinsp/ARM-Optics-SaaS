import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/lib/utils";
import { STAFF_ROLE_LABELS } from "@/lib/utils";
import type { StaffProfile } from "@/types/database";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("*")
    .eq("id", user?.id ?? "")
    .single();

  const { data: allStaff } = await supabase
    .from("staff_profiles")
    .select("*")
    .order("full_name");

  const isAdmin = profile?.role === "admin";

  return (
    <div>
      <PageHeader title="Settings" description="Platform configuration and staff management" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Profile */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-dark-200 mb-4 pb-2 border-b border-white/[0.06]">
            My Profile
          </h3>
          {profile && (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-dark-500">Full Name</p>
                <p className="text-dark-200">{profile.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-dark-500">Email</p>
                <p className="text-dark-200">{profile.email}</p>
              </div>
              <div>
                <p className="text-xs text-dark-500">Role</p>
                <p className="text-dark-200">{STAFF_ROLE_LABELS[profile.role]}</p>
              </div>
              <div>
                <p className="text-xs text-dark-500">Member since</p>
                <p className="text-dark-200">{formatDate(profile.created_at)}</p>
              </div>
            </div>
          )}
        </div>

        {/* GenSoft Integration */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-dark-200 mb-4 pb-2 border-b border-white/[0.06]">
            GenSoft MoneyWorks
          </h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-dark-900/60 rounded-lg border border-white/[0.06]">
              <p className="text-dark-300 text-xs mb-2">Integration Status</p>
              <p className="text-dark-400 text-xs">
                Configure the GenSoft API endpoint and credentials in your environment variables:
              </p>
              <div className="mt-2 space-y-1 font-mono text-xs">
                <p className="text-dark-500">GENSOFT_API_URL</p>
                <p className="text-dark-500">GENSOFT_API_USER</p>
                <p className="text-dark-500">GENSOFT_API_PASSWORD</p>
              </div>
            </div>
            <p className="text-xs text-dark-500">
              Products sync automatically via a Supabase Edge Function cron job.
              Manual sync can be triggered via the Supabase dashboard.
            </p>
          </div>
        </div>

        {/* Staff Management (admin only) */}
        {isAdmin && (
          <div className="lg:col-span-2 card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-dark-200">Staff Members</h3>
              <p className="text-xs text-dark-500">
                Add new staff via Supabase Auth + insert into staff_profiles
              </p>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {(allStaff as StaffProfile[] ?? []).map((staff) => (
                <div key={staff.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-dark-100">{staff.full_name}</p>
                    <p className="text-xs text-dark-400">{staff.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs border border-white/10 bg-white/5 text-dark-300 px-2 py-0.5 rounded-full">
                      {STAFF_ROLE_LABELS[staff.role]}
                    </span>
                    <span className={`text-xs ${staff.is_active ? "text-green-400" : "text-red-400"}`}>
                      {staff.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email Configuration */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-dark-200 mb-4 pb-2 border-b border-white/[0.06]">
            Email Configuration
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-dark-400 text-xs">
              Email reminders are sent via the configured email provider.
              Set these environment variables:
            </p>
            <div className="mt-2 space-y-1 font-mono text-xs">
              <p className="text-dark-500">RESEND_API_KEY</p>
              <p className="text-dark-500">EMAIL_FROM</p>
            </div>
            <p className="text-xs text-dark-500 mt-2">
              Supports: Glasses ready notifications, Eye exam reminders.
              SMS support planned for Phase 2.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
