import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowLeft, Plus, Phone, Mail, MapPin, Calendar,
  ShieldCheck, Eye, ShoppingBag, ChevronRight
} from "lucide-react";
import { formatDate, formatCurrency, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, PRESCRIPTION_TYPE_LABELS, formatRxValue } from "@/lib/utils";
import type { Order, Prescription } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: customer },
    { data: orders },
    { data: prescriptions },
  ] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).single(),
    supabase
      .from("orders")
      .select("*")
      .eq("customer_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("prescriptions")
      .select("*")
      .eq("customer_id", id)
      .order("exam_date", { ascending: false })
      .limit(5),
  ]);

  if (!customer) notFound();

  const latestRx = prescriptions?.[0] as Prescription | undefined;

  return (
    <div>
      <div className="mb-4">
        <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-dark-400 hover:text-dark-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> All customers
        </Link>
      </div>

      <PageHeader
        title={`${customer.first_name} ${customer.last_name}`}
        description={`Customer since ${formatDate(customer.created_at)}`}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/customers/${id}/edit`}>Edit Profile</Link>
            </Button>
            <Button asChild size="sm">
              <Link href={`/orders/new?customer=${id}`}>
                <Plus className="w-4 h-4" /> New Order
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Contact info */}
        <div className="space-y-4">
          {/* Contact Card */}
          <div className="card p-5">
            <h3 className="section-label mb-4">Contact</h3>
            <div className="space-y-3">
              {customer.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-dark-500 flex-shrink-0" />
                  <span className="text-dark-200">{customer.phone}</span>
                </div>
              )}
              {customer.mobile && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-dark-500 flex-shrink-0" />
                  <span className="text-dark-200">{customer.mobile}
                    <span className="ml-1.5 text-xs text-dark-500">mobile</span>
                  </span>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-dark-500 flex-shrink-0" />
                  <span className="text-dark-200 break-all">{customer.email}</span>
                </div>
              )}
              {customer.date_of_birth && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-dark-500 flex-shrink-0" />
                  <span className="text-dark-200">{formatDate(customer.date_of_birth)}</span>
                </div>
              )}
              {(customer.address_line1 || customer.suburb) && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-dark-500 flex-shrink-0 mt-0.5" />
                  <div className="text-dark-200">
                    {customer.address_line1 && <p>{customer.address_line1}</p>}
                    {customer.address_line2 && <p>{customer.address_line2}</p>}
                    {[customer.suburb, customer.state, customer.postcode]
                      .filter(Boolean)
                      .join(" ")}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Health Fund */}
          {(customer.health_fund_name || customer.medicare_number) && (
            <div className="card p-5">
              <h3 className="section-label mb-4">Health & Medicare</h3>
              <div className="space-y-2 text-sm">
                {customer.medicare_number && (
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-dark-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-dark-400">Medicare</p>
                      <p className="text-dark-200">{customer.medicare_number}</p>
                    </div>
                  </div>
                )}
                {customer.health_fund_name && (
                  <div className="pt-2 border-t border-white/[0.06]">
                    <p className="text-xs text-dark-400">Health Fund</p>
                    <p className="text-dark-200">{customer.health_fund_name}</p>
                    {customer.health_fund_number && (
                      <p className="text-dark-300 text-xs mt-0.5">{customer.health_fund_number}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {customer.notes && (
            <div className="card p-5">
              <h3 className="section-label mb-3">Notes</h3>
              <p className="text-sm text-dark-300 whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}
        </div>

        {/* Right columns: Orders + Prescriptions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Latest Prescription Summary */}
          {latestRx && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gold" />
                  <h3 className="text-sm font-semibold text-dark-200">Latest Prescription</h3>
                  <Badge variant="secondary">{PRESCRIPTION_TYPE_LABELS[latestRx.prescription_type]}</Badge>
                </div>
                <Link href={`/customers/${id}/prescriptions`} className="text-xs text-gold hover:text-gold-light transition-colors flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-xs text-dark-400 mb-3">{formatDate(latestRx.exam_date)} · {latestRx.prescribing_optom || "Unknown optometrist"}</p>

              {/* Rx table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center">
                  <thead>
                    <tr className="text-dark-500">
                      <th className="text-left py-1.5 pr-3 font-medium text-dark-400 w-8"></th>
                      <th className="py-1.5 px-2 font-medium">SPH</th>
                      <th className="py-1.5 px-2 font-medium">CYL</th>
                      <th className="py-1.5 px-2 font-medium">AXIS</th>
                      <th className="py-1.5 px-2 font-medium">ADD</th>
                      <th className="py-1.5 px-2 font-medium">VA</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-white/[0.05]">
                      <td className="text-left py-2 pr-3 text-dark-400 font-medium">OD</td>
                      <td className="py-2 px-2 text-dark-200 tabular-nums">{formatRxValue(latestRx.od_sph)}</td>
                      <td className="py-2 px-2 text-dark-200 tabular-nums">{formatRxValue(latestRx.od_cyl)}</td>
                      <td className="py-2 px-2 text-dark-200 tabular-nums">{latestRx.od_axis ?? "—"}</td>
                      <td className="py-2 px-2 text-dark-200 tabular-nums">{formatRxValue(latestRx.od_add)}</td>
                      <td className="py-2 px-2 text-dark-200">{latestRx.od_va ?? "—"}</td>
                    </tr>
                    <tr className="border-t border-white/[0.05]">
                      <td className="text-left py-2 pr-3 text-dark-400 font-medium">OS</td>
                      <td className="py-2 px-2 text-dark-200 tabular-nums">{formatRxValue(latestRx.os_sph)}</td>
                      <td className="py-2 px-2 text-dark-200 tabular-nums">{formatRxValue(latestRx.os_cyl)}</td>
                      <td className="py-2 px-2 text-dark-200 tabular-nums">{latestRx.os_axis ?? "—"}</td>
                      <td className="py-2 px-2 text-dark-200 tabular-nums">{formatRxValue(latestRx.os_add)}</td>
                      <td className="py-2 px-2 text-dark-200">{latestRx.os_va ?? "—"}</td>
                    </tr>
                  </tbody>
                </table>
                {(latestRx.pd_distance_right || latestRx.pd_single) && (
                  <p className="text-xs text-dark-400 mt-2">
                    PD: {latestRx.pd_single
                      ? `${latestRx.pd_single} (single)`
                      : `R ${latestRx.pd_distance_right} / L ${latestRx.pd_distance_left}`}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06]">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/customers/${id}/prescriptions`}>
                    <Plus className="w-3.5 h-3.5" /> Add Prescription
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {!latestRx && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-dark-500" />
                  <h3 className="text-sm font-semibold text-dark-200">Prescriptions</h3>
                </div>
              </div>
              <p className="text-sm text-dark-400 mb-3">No prescriptions recorded.</p>
              <Button asChild size="sm" variant="outline">
                <Link href={`/customers/${id}/prescriptions`}>
                  <Plus className="w-3.5 h-3.5" /> Add Prescription
                </Link>
              </Button>
            </div>
          )}

          {/* Orders */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-dark-500" />
                <h3 className="text-sm font-semibold text-dark-200">Orders</h3>
                <span className="text-xs text-dark-500">({orders?.length ?? 0})</span>
              </div>
              <Button asChild size="sm">
                <Link href={`/orders/new?customer=${id}`}>
                  <Plus className="w-3.5 h-3.5" /> New Order
                </Link>
              </Button>
            </div>

            {!orders || orders.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-dark-400">No orders yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {(orders as Order[]).map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-medium text-dark-100 group-hover:text-gold transition-colors">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-dark-400">{formatDate(order.order_date)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-dark-200">{formatCurrency(order.total_price)}</span>
                      <span className={`status-badge ${ORDER_STATUS_COLORS[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                      <ChevronRight className="w-4 h-4 text-dark-600 group-hover:text-gold transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
