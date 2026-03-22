import { createClient } from "@/lib/supabase/server";
import { getLocale, getDict } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { formatDate, formatCurrency, formatRxValue, ORDER_STATUS_COLORS } from "@/lib/utils";
import type { OrderWithDetails } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PrintOrderPage({ params }: PageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.print;

  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, customers(*), prescriptions(*)")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const o = order as OrderWithDetails;
  const c = o.customers;
  const balance = o.total_price - o.deposit_paid;

  return (
    <>
      {/* Print button - hidden when printing */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-white border border-brand-200 rounded-lg text-sm text-brand-800 hover:bg-brand-100 transition-colors"
        >
          {t.printSavePdf}
        </button>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 bg-white border border-brand-200 rounded-lg text-sm text-brand-500 hover:bg-brand-100 transition-colors"
        >
          {t.close}
        </button>
      </div>

      <div className="min-h-screen bg-white text-black p-0 font-sans">
        {/* ============================================================
            FULL ORDER DOCUMENT
        ============================================================ */}
        <div className="max-w-[210mm] mx-auto p-6 print:p-0 print:max-w-none">

          {/* Header */}
          <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-gray-800">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">ARM OPTICS</h1>
              <p className="text-xs text-gray-500 mt-0.5">{t.opticalOrderForm}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold tabular-nums text-gray-800">{o.order_number}</p>
              <p className="text-xs text-gray-500">{formatDate(o.order_date)}</p>
              <p className="text-xs font-semibold mt-1 uppercase tracking-wide text-gray-700">
                {dict.enums.orderStatus[o.status as keyof typeof dict.enums.orderStatus] ?? o.status}
              </p>
            </div>
          </div>

          {/* Two-column: Customer + Pricing */}
          <div className="grid grid-cols-2 gap-6 mb-5">
            {/* Customer */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{t.customer}</p>
              <p className="font-bold text-gray-900">{c.first_name} {c.last_name}</p>
              {(c.phone || c.mobile) && <p className="text-sm text-gray-700">{c.phone || c.mobile}</p>}
              {c.email && <p className="text-sm text-gray-600">{c.email}</p>}
              {(c.address_line1 || c.suburb) && (
                <p className="text-sm text-gray-600 mt-1">
                  {[c.address_line1, c.suburb, c.state, c.postcode].filter(Boolean).join(", ")}
                </p>
              )}
              {c.medicare_number && (
                <p className="text-xs text-gray-500 mt-1">{t.medicare}: {c.medicare_number}</p>
              )}
              {c.health_fund_name && (
                <p className="text-xs text-gray-500">
                  {c.health_fund_name} {c.health_fund_number && `· ${c.health_fund_number}`}
                </p>
              )}
            </div>

            {/* Pricing */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{t.pricing}</p>
              <div className="border border-gray-300 rounded overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-1.5 px-3 text-gray-600">{t.totalPrice}</td>
                      <td className="py-1.5 px-3 text-right font-semibold">{formatCurrency(o.total_price)}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-1.5 px-3 text-gray-600">{t.depositPaid}</td>
                      <td className="py-1.5 px-3 text-right">{formatCurrency(o.deposit_paid)}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-1.5 px-3 font-bold text-gray-800">{t.balanceDue}</td>
                      <td className="py-1.5 px-3 text-right font-bold text-gray-900">{formatCurrency(balance)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {o.collection_date && (
                <p className="text-xs text-gray-500 mt-2">
                  {t.estCollection}: <strong>{formatDate(o.collection_date)}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Prescription */}
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{t.spectaclePrescription}</p>
            <table className="w-full border border-gray-300 text-sm text-center rounded overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-1.5 px-3 text-left text-gray-600 font-semibold border-r border-gray-300 w-14"></th>
                  <th className="py-1.5 px-3 text-gray-600 font-semibold border-r border-gray-300">SPH</th>
                  <th className="py-1.5 px-3 text-gray-600 font-semibold border-r border-gray-300">CYL</th>
                  <th className="py-1.5 px-3 text-gray-600 font-semibold border-r border-gray-300">AXIS</th>
                  <th className="py-1.5 px-3 text-gray-600 font-semibold border-r border-gray-300">ADD</th>
                  <th className="py-1.5 px-3 text-gray-600 font-semibold border-r border-gray-300">PD (dist)</th>
                  <th className="py-1.5 px-3 text-gray-600 font-semibold">PD (near)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-200">
                  <td className="py-2 px-3 text-left font-bold border-r border-gray-300">OD</td>
                  <td className="py-2 px-3 tabular-nums border-r border-gray-300">{formatRxValue(o.lens_od_sph)}</td>
                  <td className="py-2 px-3 tabular-nums border-r border-gray-300">{formatRxValue(o.lens_od_cyl)}</td>
                  <td className="py-2 px-3 tabular-nums border-r border-gray-300">{o.lens_od_axis ?? "—"}</td>
                  <td className="py-2 px-3 tabular-nums border-r border-gray-300">{formatRxValue(o.lens_od_add)}</td>
                  <td className="py-2 px-3 tabular-nums border-r border-gray-300">{o.pd_distance_right ?? "—"}</td>
                  <td className="py-2 px-3 tabular-nums">{o.pd_near_right ?? "—"}</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td className="py-2 px-3 text-left font-bold border-r border-gray-300">OS</td>
                  <td className="py-2 px-3 tabular-nums border-r border-gray-300">{formatRxValue(o.lens_os_sph)}</td>
                  <td className="py-2 px-3 tabular-nums border-r border-gray-300">{formatRxValue(o.lens_os_cyl)}</td>
                  <td className="py-2 px-3 tabular-nums border-r border-gray-300">{o.lens_os_axis ?? "—"}</td>
                  <td className="py-2 px-3 tabular-nums border-r border-gray-300">{formatRxValue(o.lens_os_add)}</td>
                  <td className="py-2 px-3 tabular-nums border-r border-gray-300">{o.pd_distance_left ?? "—"}</td>
                  <td className="py-2 px-3 tabular-nums">{o.pd_near_left ?? "—"}</td>
                </tr>
              </tbody>
            </table>
            {o.pd_single && (
              <p className="text-xs text-gray-500 mt-1">{t.singlePd}: {o.pd_single}</p>
            )}
          </div>

          {/* Frame & Lenses side by side */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{t.frame}</p>
              <div className="border border-gray-300 rounded p-3 text-sm">
                {o.frame_brand && <p className="font-semibold">{o.frame_brand}</p>}
                {o.frame_model && <p className="text-gray-700">{o.frame_model}</p>}
                {o.frame_colour && <p className="text-gray-600">{o.frame_colour}</p>}
                {o.frame_size && <p className="text-gray-500 text-xs">{o.frame_size}</p>}
                {o.frame_supplier && <p className="text-gray-500 text-xs">{t.supplier}: {o.frame_supplier}</p>}
                {o.frame_gensoft_sku && <p className="text-gray-400 text-xs">SKU: {o.frame_gensoft_sku}</p>}
                {!o.frame_brand && !o.frame_model && <p className="text-gray-400">—</p>}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{t.lenses}</p>
              <div className="border border-gray-300 rounded p-3 text-sm">
                {o.lens_type && <p className="font-semibold">{o.lens_type}</p>}
                {o.lens_material && <p className="text-gray-700">{o.lens_material}</p>}
                {o.lens_coating && <p className="text-gray-600">{o.lens_coating}</p>}
                {o.lens_supplier && <p className="text-gray-500 text-xs">{t.supplier}: {o.lens_supplier}</p>}
                {o.lens_gensoft_sku && <p className="text-gray-400 text-xs">SKU: {o.lens_gensoft_sku}</p>}
                {!o.lens_type && !o.lens_material && <p className="text-gray-400">—</p>}
              </div>
            </div>
          </div>

          {/* Services & Accessories */}
          {((o.services && o.services.length > 0) || (o.accessories && o.accessories.length > 0)) && (
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{t.servicesAccessories}</p>
              <table className="w-full border border-gray-300 text-sm rounded overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-1.5 px-3 text-left text-gray-600 font-semibold border-r border-gray-300">{t.item}</th>
                    <th className="py-1.5 px-3 text-center text-gray-600 font-semibold border-r border-gray-300 w-16">{t.qty}</th>
                    <th className="py-1.5 px-3 text-right text-gray-600 font-semibold w-24">{t.price}</th>
                  </tr>
                </thead>
                <tbody>
                  {o.services?.map((svc, i) => (
                    <tr key={`svc-${i}`} className="border-t border-gray-200">
                      <td className="py-1.5 px-3 border-r border-gray-300">{svc.name}</td>
                      <td className="py-1.5 px-3 text-center border-r border-gray-300">1</td>
                      <td className="py-1.5 px-3 text-right">{formatCurrency(svc.price)}</td>
                    </tr>
                  ))}
                  {o.accessories?.map((acc, i) => (
                    <tr key={`acc-${i}`} className="border-t border-gray-200">
                      <td className="py-1.5 px-3 border-r border-gray-300">{acc.name} {acc.sku && <span className="text-gray-400 text-xs">({acc.sku})</span>}</td>
                      <td className="py-1.5 px-3 text-center border-r border-gray-300">{acc.qty}</td>
                      <td className="py-1.5 px-3 text-right">{formatCurrency(acc.price * acc.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Notes */}
          {o.notes && (
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{t.notes}</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap border border-gray-200 rounded p-2">{o.notes}</p>
            </div>
          )}

          {/* Lab */}
          {(o.lab_name || o.lab_order_ref) && (
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{t.laboratory}</p>
              <p className="text-sm text-gray-700">
                {o.lab_name} {o.lab_order_ref && `· ${t.labRef}: ${o.lab_order_ref}`}
                {o.lab_sent_date && ` · ${t.labSent}: ${formatDate(o.lab_sent_date)}`}
              </p>
            </div>
          )}

          {/* Signature */}
          <div className="mt-8 pt-4 border-t border-gray-300 grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-gray-500 mb-6">{t.customerSignature}</p>
              <div className="border-b border-gray-400 w-full" />
              <p className="text-xs text-gray-400 mt-1">{t.signatureDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-6">{t.staffAuthorisation}</p>
              <div className="border-b border-gray-400 w-full" />
              <p className="text-xs text-gray-400 mt-1">{t.signatureDate}</p>
            </div>
          </div>

          {/* ============================================================
              CUSTOMER RECEIPT SLIP (dashed cut line)
          ============================================================ */}
          <div className="mt-8 pt-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 border-t-2 border-dashed border-gray-400" />
              <p className="text-xs text-gray-400 font-medium px-2">✂  {t.customerReceipt}</p>
              <div className="flex-1 border-t-2 border-dashed border-gray-400" />
            </div>

            <div className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">ARM OPTICS</h2>
                  <p className="text-xs text-gray-500">{t.receiptTitle}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 tabular-nums">{o.order_number}</p>
                  <p className="text-xs text-gray-500">{formatDate(o.order_date)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <p className="font-semibold text-gray-800">{c.first_name} {c.last_name}</p>
                  {(c.phone || c.mobile) && <p className="text-gray-600">{c.phone || c.mobile}</p>}
                </div>
                <div className="text-right">
                  <p className="text-gray-600">{t.total}: <strong>{formatCurrency(o.total_price)}</strong></p>
                  <p className="text-gray-600">{t.deposit}: {formatCurrency(o.deposit_paid)}</p>
                  <p className="font-bold text-gray-800">{t.balance}: {formatCurrency(balance)}</p>
                </div>
              </div>

              {o.frame_brand && (
                <p className="text-xs text-gray-500">
                  {t.frame}: {o.frame_brand} {o.frame_model} {o.frame_colour && `· ${o.frame_colour}`}
                </p>
              )}
              {o.lens_type && (
                <p className="text-xs text-gray-500">
                  {t.lenses}: {o.lens_type} {o.lens_material && `· ${o.lens_material}`}
                </p>
              )}
              {o.collection_date && (
                <p className="text-xs text-gray-500 mt-1">
                  {t.estReady}: <strong>{formatDate(o.collection_date)}</strong>
                </p>
              )}

              <div className="mt-3 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-400 text-center">
                  {t.retainReceipt}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          @page { margin: 15mm; }
        }
      `}</style>
    </>
  );
}
