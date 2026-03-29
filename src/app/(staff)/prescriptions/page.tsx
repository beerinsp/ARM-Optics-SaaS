import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate, formatRxValue } from "@/lib/utils";
import Link from "next/link";
import type { Prescription } from "@/types/database";

export default async function PrescriptionsPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.prescriptions;

  const supabase = await createClient();

  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select("*, customers(id, first_name, last_name)")
    .order("exam_date", { ascending: false })
    .limit(50);

  return (
    <div>
      <PageHeader
        title={t.title}
        description={t.description}
      />

      <div className="card overflow-hidden">
        {!prescriptions || prescriptions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-brand-500 text-sm">{t.noPrescriptions}</p>
          </div>
        ) : (
          <div className="divide-y divide-brand-100">
            {(prescriptions as (Prescription & { customers: { id: string; first_name: string; last_name: string } | null })[]).map((rx) => (
              <Link
                key={rx.id}
                href={`/customers/${rx.customer_id}/prescriptions`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-brand-50 transition-colors group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-brand-900 group-hover:text-accent transition-colors">
                      {rx.customers?.first_name} {rx.customers?.last_name}
                    </p>
                    <span className="text-xs border border-brand-200 bg-white/5 text-brand-500 px-2 py-0.5 rounded-full">
                      {dict.enums.prescriptionType[rx.prescription_type as keyof typeof dict.enums.prescriptionType] ?? rx.prescription_type}
                    </span>
                  </div>
                  <p className="text-xs text-brand-500 mt-0.5">
                    {rx.prescribing_optom || t.unknownOptometrist}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-brand-800 tabular-nums">
                    OD: {formatRxValue(rx.od_sph)} / {formatRxValue(rx.od_cyl)}
                  </p>
                  <p className="text-xs text-brand-500">{formatDate(rx.exam_date)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
