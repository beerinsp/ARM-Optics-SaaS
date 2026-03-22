import { createClient } from "@/lib/supabase/server";
import { getLocale, getDict } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatDate, formatRxValue } from "@/lib/utils";
import type { Prescription } from "@/types/database";
import { AddPrescriptionClient } from "./AddPrescriptionClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PrescriptionsPage({ params }: PageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.prescriptions;

  const supabase = await createClient();

  const [{ data: customer }, { data: prescriptions }] = await Promise.all([
    supabase.from("customers").select("id, first_name, last_name").eq("id", id).single(),
    supabase
      .from("prescriptions")
      .select("*")
      .eq("customer_id", id)
      .order("exam_date", { ascending: false }),
  ]);

  if (!customer) notFound();

  return (
    <div>
      <div className="mb-4">
        <Link href={`/customers/${id}`} className="inline-flex items-center gap-1 text-sm text-brand-500 hover:text-brand-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {customer.first_name} {customer.last_name}
        </Link>
      </div>
      <PageHeader
        title={t.prescriptionsTitle}
        description={`${customer.first_name} ${customer.last_name}`}
        actions={<AddPrescriptionClient customerId={id} />}
      />

      <div className="space-y-4">
        {!prescriptions || prescriptions.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-brand-500 text-sm">{t.noPrescriptionsYet}</p>
          </div>
        ) : (
          (prescriptions as Prescription[]).map((rx) => (
            <div key={rx.id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-brand-900">{formatDate(rx.exam_date)}</span>
                    <span className="text-xs border border-brand-200 bg-white/5 text-brand-700 px-2 py-0.5 rounded-full">
                      {dict.enums.prescriptionType[rx.prescription_type as keyof typeof dict.enums.prescriptionType] ?? rx.prescription_type}
                    </span>
                  </div>
                  {rx.prescribing_optom && (
                    <p className="text-xs text-brand-500 mt-0.5">{rx.prescribing_optom}</p>
                  )}
                </div>
                {rx.next_exam_date && (
                  <p className="text-xs text-brand-500">
                    {t.nextExam}: <span className="text-brand-800">{formatDate(rx.next_exam_date)}</span>
                  </p>
                )}
              </div>

              {rx.prescription_type !== "contact_lens" ? (
                <>
                  <div className="overflow-x-auto mb-3">
                    <table className="w-full text-sm text-center">
                      <thead>
                        <tr>
                          <th className="text-left pb-1.5 pr-4 text-brand-400 text-xs font-medium w-10"></th>
                          <th className="pb-1.5 px-3 text-brand-500 text-xs font-medium">SPH</th>
                          <th className="pb-1.5 px-3 text-brand-500 text-xs font-medium">CYL</th>
                          <th className="pb-1.5 px-3 text-brand-500 text-xs font-medium">AXIS</th>
                          <th className="pb-1.5 px-3 text-brand-500 text-xs font-medium">ADD</th>
                          <th className="pb-1.5 px-3 text-brand-500 text-xs font-medium">VA</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-brand-100">
                          <td className="text-left py-2 pr-4 text-brand-500 font-semibold text-xs">OD</td>
                          <td className="py-2 px-3 text-brand-800 tabular-nums">{formatRxValue(rx.od_sph)}</td>
                          <td className="py-2 px-3 text-brand-800 tabular-nums">{formatRxValue(rx.od_cyl)}</td>
                          <td className="py-2 px-3 text-brand-800 tabular-nums">{rx.od_axis ?? "—"}</td>
                          <td className="py-2 px-3 text-brand-800 tabular-nums">{formatRxValue(rx.od_add)}</td>
                          <td className="py-2 px-3 text-brand-800">{rx.od_va ?? "—"}</td>
                        </tr>
                        <tr className="border-t border-brand-100">
                          <td className="text-left py-2 pr-4 text-brand-500 font-semibold text-xs">OS</td>
                          <td className="py-2 px-3 text-brand-800 tabular-nums">{formatRxValue(rx.os_sph)}</td>
                          <td className="py-2 px-3 text-brand-800 tabular-nums">{formatRxValue(rx.os_cyl)}</td>
                          <td className="py-2 px-3 text-brand-800 tabular-nums">{rx.os_axis ?? "—"}</td>
                          <td className="py-2 px-3 text-brand-800 tabular-nums">{formatRxValue(rx.os_add)}</td>
                          <td className="py-2 px-3 text-brand-800">{rx.os_va ?? "—"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {(rx.pd_distance_right || rx.pd_single) && (
                    <p className="text-xs text-brand-500">
                      PD: {rx.pd_single
                        ? `${rx.pd_single} (${dict.common.single})`
                        : `R ${rx.pd_distance_right ?? "—"} / L ${rx.pd_distance_left ?? "—"}`}
                    </p>
                  )}
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[{ eye: `OD (${dict.common.right})`, brand: rx.cl_od_brand, bc: rx.cl_od_base_curve, dia: rx.cl_od_diameter, pwr: rx.cl_od_power, cyl: rx.cl_od_cylinder, axis: rx.cl_od_axis },
                    { eye: `OS (${dict.common.left})`, brand: rx.cl_os_brand, bc: rx.cl_os_base_curve, dia: rx.cl_os_diameter, pwr: rx.cl_os_power, cyl: rx.cl_os_cylinder, axis: rx.cl_os_axis }
                  ].map(({ eye, brand, bc, dia, pwr, cyl, axis }) => (
                    <div key={eye} className="bg-brand-50/40 rounded-lg p-3">
                      <p className="text-xs font-semibold text-brand-500 mb-2">{eye}</p>
                      {brand && <p className="text-brand-800">{brand}</p>}
                      <p className="text-brand-500 text-xs mt-1">
                        {[
                          bc && `BC: ${bc}`,
                          dia && `Dia: ${dia}`,
                          pwr && `Pwr: ${formatRxValue(pwr)}`,
                          cyl && `Cyl: ${formatRxValue(cyl)}`,
                          axis && `Axis: ${axis}`,
                        ].filter(Boolean).join("  ·  ")}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {rx.notes && (
                <p className="text-xs text-brand-500 mt-3 pt-3 border-t border-brand-100">
                  {rx.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
