import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft, Printer, Edit, User, MapPin, Eye, Package,
  Wrench, ShoppingCart, DollarSign, FlaskConical, CheckCircle2
} from "lucide-react";
import {
  formatDate, formatCurrency, formatRxValue,
  ORDER_STATUS_COLORS, ORDER_STATUS_LABELS
} from "@/lib/utils";
import type { OrderWithDetails } from "@/types/database";
import { OrderStatusUpdater } from "./OrderStatusUpdater";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, customers(*), prescriptions(*)")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const o = order as OrderWithDetails;
  const customer = o.customers;
  const balance = o.total_price - o.deposit_paid;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-dark-400 hover:text-dark-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> All orders
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/orders/${id}/print`} target="_blank">
              <Printer className="w-4 h-4" /> Print
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/orders/${id}/edit`}>
              <Edit className="w-4 h-4" /> Edit
            </Link>
          </Button>
        </div>
      </div>

      <PageHeader
        title={o.order_number}
        description={`Order date: ${formatDate(o.order_date)}`}
        actions={
          <OrderStatusUpdater orderId={id} currentStatus={o.status} />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Customer & meta */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-dark-500" />
              <h3 className="section-label">Customer</h3>
            </div>
            <Link
              href={`/customers/${customer.id}`}
              className="font-medium text-dark-100 hover:text-gold transition-colors text-sm block mb-1"
            >
              {customer.first_name} {customer.last_name}
            </Link>
            <div className="text-xs text-dark-400 space-y-0.5">
              {customer.phone && <p>{customer.phone}</p>}
              {customer.mobile && <p>{customer.mobile}</p>}
              {customer.email && <p>{customer.email}</p>}
              {(customer.address_line1 || customer.suburb) && (
                <p className="mt-2">
                  {[customer.address_line1, customer.suburb, customer.state, customer.postcode]
                    .filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-dark-500" />
              <h3 className="section-label">Pricing</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">Total</span>
                <span className="text-dark-100 font-medium">{formatCurrency(o.total_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Deposit</span>
                <span className="text-green-400">- {formatCurrency(o.deposit_paid)}</span>
              </div>
              <div className="flex justify-between border-t border-white/[0.06] pt-2">
                <span className="text-dark-300 font-medium">Balance Due</span>
                <span className={`font-semibold ${balance > 0 ? "text-yellow-300" : "text-green-400"}`}>
                  {formatCurrency(balance)}
                </span>
              </div>
            </div>
          </div>

          {/* Lab */}
          {(o.lab_name || o.lab_order_ref) && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <FlaskConical className="w-4 h-4 text-dark-500" />
                <h3 className="section-label">Laboratory</h3>
              </div>
              <div className="text-sm space-y-1">
                {o.lab_name && <p className="text-dark-200">{o.lab_name}</p>}
                {o.lab_order_ref && <p className="text-dark-400">Ref: {o.lab_order_ref}</p>}
                {o.lab_sent_date && <p className="text-dark-400">Sent: {formatDate(o.lab_sent_date)}</p>}
              </div>
            </div>
          )}

          {/* Acknowledgement */}
          <div className={`card p-4 flex items-center gap-3 ${o.customer_acknowledged ? "border-green-500/20" : ""}`}>
            <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${o.customer_acknowledged ? "text-green-400" : "text-dark-600"}`} />
            <div>
              <p className="text-xs font-medium text-dark-300">Customer Acknowledgement</p>
              <p className="text-xs text-dark-500">
                {o.customer_acknowledged
                  ? `Confirmed ${o.acknowledged_at ? formatDate(o.acknowledged_at) : ""}`
                  : "Not confirmed"}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Order details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Prescription */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-gold" />
              <h3 className="section-label">Prescription</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-center">
                <thead>
                  <tr>
                    <th className="text-left pb-2 pr-3 text-dark-500 font-medium text-xs w-10"></th>
                    <th className="pb-2 px-3 text-dark-400 font-medium text-xs">SPH</th>
                    <th className="pb-2 px-3 text-dark-400 font-medium text-xs">CYL</th>
                    <th className="pb-2 px-3 text-dark-400 font-medium text-xs">AXIS</th>
                    <th className="pb-2 px-3 text-dark-400 font-medium text-xs">ADD</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-white/[0.05]">
                    <td className="text-left py-2 pr-3 text-dark-400 font-semibold text-xs">OD</td>
                    <td className="py-2 px-3 text-dark-200 tabular-nums">{formatRxValue(o.lens_od_sph)}</td>
                    <td className="py-2 px-3 text-dark-200 tabular-nums">{formatRxValue(o.lens_od_cyl)}</td>
                    <td className="py-2 px-3 text-dark-200 tabular-nums">{o.lens_od_axis ?? "—"}</td>
                    <td className="py-2 px-3 text-dark-200 tabular-nums">{formatRxValue(o.lens_od_add)}</td>
                  </tr>
                  <tr className="border-t border-white/[0.05]">
                    <td className="text-left py-2 pr-3 text-dark-400 font-semibold text-xs">OS</td>
                    <td className="py-2 px-3 text-dark-200 tabular-nums">{formatRxValue(o.lens_os_sph)}</td>
                    <td className="py-2 px-3 text-dark-200 tabular-nums">{formatRxValue(o.lens_os_cyl)}</td>
                    <td className="py-2 px-3 text-dark-200 tabular-nums">{o.lens_os_axis ?? "—"}</td>
                    <td className="py-2 px-3 text-dark-200 tabular-nums">{formatRxValue(o.lens_os_add)}</td>
                  </tr>
                </tbody>
              </table>
              {(o.pd_distance_right || o.pd_single) && (
                <p className="text-xs text-dark-400 mt-3">
                  PD:{" "}
                  {o.pd_single
                    ? `${o.pd_single} (single)`
                    : `R ${o.pd_distance_right ?? "—"} / L ${o.pd_distance_left ?? "—"}`}
                </p>
              )}
            </div>
          </div>

          {/* Frame & Lens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(o.frame_brand || o.frame_model) && (
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-dark-500" />
                  <h3 className="section-label">Frame</h3>
                </div>
                <div className="text-sm space-y-1">
                  {o.frame_brand && <p className="text-dark-200 font-medium">{o.frame_brand}</p>}
                  {o.frame_model && <p className="text-dark-300">{o.frame_model}</p>}
                  {o.frame_colour && <p className="text-dark-400">{o.frame_colour}</p>}
                  {o.frame_size && <p className="text-dark-400 text-xs">{o.frame_size}</p>}
                  {o.frame_supplier && <p className="text-dark-500 text-xs">Supplier: {o.frame_supplier}</p>}
                  {o.frame_gensoft_sku && <p className="text-dark-500 text-xs">SKU: {o.frame_gensoft_sku}</p>}
                </div>
              </div>
            )}

            {(o.lens_type || o.lens_material) && (
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4 text-dark-500" />
                  <h3 className="section-label">Lenses</h3>
                </div>
                <div className="text-sm space-y-1">
                  {o.lens_type && <p className="text-dark-200 font-medium">{o.lens_type}</p>}
                  {o.lens_material && <p className="text-dark-300">{o.lens_material}</p>}
                  {o.lens_coating && <p className="text-dark-400">{o.lens_coating}</p>}
                  {o.lens_supplier && <p className="text-dark-500 text-xs">Supplier: {o.lens_supplier}</p>}
                  {o.lens_gensoft_sku && <p className="text-dark-500 text-xs">SKU: {o.lens_gensoft_sku}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Services */}
          {o.services && o.services.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="w-4 h-4 text-dark-500" />
                <h3 className="section-label">Services</h3>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {o.services.map((svc, i) => (
                  <div key={i} className="flex justify-between py-2 text-sm">
                    <span className="text-dark-300">{svc.name}</span>
                    <span className="text-dark-200">{formatCurrency(svc.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accessories */}
          {o.accessories && o.accessories.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart className="w-4 h-4 text-dark-500" />
                <h3 className="section-label">Accessories</h3>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {o.accessories.map((acc, i) => (
                  <div key={i} className="flex justify-between py-2 text-sm">
                    <span className="text-dark-300">
                      {acc.name} {acc.qty > 1 && <span className="text-dark-500">× {acc.qty}</span>}
                    </span>
                    <span className="text-dark-200">{formatCurrency(acc.price * acc.qty)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {(o.notes || o.internal_notes) && (
            <div className="card p-5 space-y-3">
              {o.notes && (
                <div>
                  <h4 className="section-label mb-2">Notes</h4>
                  <p className="text-sm text-dark-300 whitespace-pre-wrap">{o.notes}</p>
                </div>
              )}
              {o.internal_notes && (
                <div className={o.notes ? "pt-3 border-t border-white/[0.06]" : ""}>
                  <h4 className="section-label mb-2">Internal Notes</h4>
                  <p className="text-sm text-dark-300 whitespace-pre-wrap">{o.internal_notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
