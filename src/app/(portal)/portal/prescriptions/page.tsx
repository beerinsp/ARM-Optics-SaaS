import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate, formatRxValue, PRESCRIPTION_TYPE_LABELS } from "@/lib/utils";
import type { Prescription } from "@/types/database";
import { Eye } from "lucide-react";

export default async function PortalPrescriptionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal-login");

  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("portal_user_id", user.id)
    .single();

  if (!customer) redirect("/portal");

  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select("*")
    .eq("customer_id", customer.id)
    .order("exam_date", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark-100 font-display mb-6">My Prescriptions</h1>
      <div className="space-y-4">
        {!prescriptions || prescriptions.length === 0 ? (
          <div className="card p-12 text-center">
            <Eye className="w-10 h-10 text-dark-700 mx-auto mb-3" />
            <p className="text-dark-400">No prescriptions on file.</p>
          </div>
        ) : (
          (prescriptions as Prescription[]).map((rx) => (
            <div key={rx.id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-dark-100">{formatDate(rx.exam_date)}</span>
                    <span className="text-xs border border-white/10 bg-white/5 text-dark-300 px-2 py-0.5 rounded-full">
                      {PRESCRIPTION_TYPE_LABELS[rx.prescription_type]}
                    </span>
                  </div>
                  {rx.prescribing_optom && (
                    <p className="text-xs text-dark-400 mt-0.5">{rx.prescribing_optom}</p>
                  )}
                </div>
                {rx.next_exam_date && (
                  <div className="text-right">
                    <p className="text-xs text-dark-500">Next exam</p>
                    <p className="text-xs text-dark-200">{formatDate(rx.next_exam_date)}</p>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-center">
                  <thead>
                    <tr>
                      <th className="text-left pb-1.5 pr-4 text-dark-500 text-xs w-10"></th>
                      <th className="pb-1.5 px-3 text-dark-400 text-xs">SPH</th>
                      <th className="pb-1.5 px-3 text-dark-400 text-xs">CYL</th>
                      <th className="pb-1.5 px-3 text-dark-400 text-xs">AXIS</th>
                      <th className="pb-1.5 px-3 text-dark-400 text-xs">ADD</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-white/[0.05]">
                      <td className="text-left py-2 pr-4 text-dark-400 font-semibold text-xs">OD</td>
                      <td className="py-2 px-3 text-dark-200 tabular-nums">{formatRxValue(rx.od_sph)}</td>
                      <td className="py-2 px-3 text-dark-200 tabular-nums">{formatRxValue(rx.od_cyl)}</td>
                      <td className="py-2 px-3 text-dark-200 tabular-nums">{rx.od_axis ?? "—"}</td>
                      <td className="py-2 px-3 text-dark-200 tabular-nums">{formatRxValue(rx.od_add)}</td>
                    </tr>
                    <tr className="border-t border-white/[0.05]">
                      <td className="text-left py-2 pr-4 text-dark-400 font-semibold text-xs">OS</td>
                      <td className="py-2 px-3 text-dark-200 tabular-nums">{formatRxValue(rx.os_sph)}</td>
                      <td className="py-2 px-3 text-dark-200 tabular-nums">{formatRxValue(rx.os_cyl)}</td>
                      <td className="py-2 px-3 text-dark-200 tabular-nums">{rx.os_axis ?? "—"}</td>
                      <td className="py-2 px-3 text-dark-200 tabular-nums">{formatRxValue(rx.os_add)}</td>
                    </tr>
                  </tbody>
                </table>
                {(rx.pd_distance_right || rx.pd_single) && (
                  <p className="text-xs text-dark-400 mt-2">
                    PD: {rx.pd_single
                      ? `${rx.pd_single} (single)`
                      : `R ${rx.pd_distance_right ?? "—"} / L ${rx.pd_distance_left ?? "—"}`}
                  </p>
                )}
              </div>
              {rx.notes && (
                <p className="text-xs text-dark-400 mt-3 pt-3 border-t border-white/[0.06]">{rx.notes}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
