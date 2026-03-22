import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate, formatRxValue, PRESCRIPTION_TYPE_LABELS } from "@/lib/utils";
import Link from "next/link";
import type { Prescription } from "@/types/database";

export default async function PrescriptionsPage() {
  const supabase = await createClient();

  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select("*, customers(id, first_name, last_name)")
    .order("exam_date", { ascending: false })
    .limit(50);

  return (
    <div>
      <PageHeader
        title="All Prescriptions"
        description="View prescriptions across all customers"
      />

      <div className="card overflow-hidden">
        {!prescriptions || prescriptions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-dark-400 text-sm">No prescriptions recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {(prescriptions as (Prescription & { customers: { id: string; first_name: string; last_name: string } | null })[]).map((rx) => (
              <Link
                key={rx.id}
                href={`/customers/${rx.customer_id}/prescriptions`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-dark-100 group-hover:text-gold transition-colors">
                      {rx.customers?.first_name} {rx.customers?.last_name}
                    </p>
                    <span className="text-xs border border-white/10 bg-white/5 text-dark-400 px-2 py-0.5 rounded-full">
                      {PRESCRIPTION_TYPE_LABELS[rx.prescription_type]}
                    </span>
                  </div>
                  <p className="text-xs text-dark-400 mt-0.5">
                    {rx.prescribing_optom || "Unknown optometrist"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-dark-200 tabular-nums">
                    OD: {formatRxValue(rx.od_sph)} / {formatRxValue(rx.od_cyl)}
                  </p>
                  <p className="text-xs text-dark-400">{formatDate(rx.exam_date)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
