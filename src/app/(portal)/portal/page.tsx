import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate, formatCurrency, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/utils";
import Link from "next/link";
import { ShoppingBag, Eye, ChevronRight, Phone, Mail } from "lucide-react";
import type { Order, Prescription } from "@/types/database";

export default async function PortalDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal-login");

  // Find customer linked to this portal user
  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("portal_user_id", user.id)
    .single();

  if (!customer) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">👋</div>
        <h2 className="text-xl font-bold text-dark-100 mb-2 font-display">Welcome to your portal</h2>
        <p className="text-dark-400 text-sm max-w-sm mx-auto">
          Your account hasn&apos;t been linked to a customer profile yet.
          Please contact ARM Optics and we&apos;ll set this up for you.
        </p>
        <p className="text-dark-500 text-xs mt-4">{user.email}</p>
      </div>
    );
  }

  const [{ data: orders }, { data: prescriptions }] = await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("prescriptions")
      .select("*")
      .eq("customer_id", customer.id)
      .order("exam_date", { ascending: false })
      .limit(3),
  ]);

  const latestRx = (prescriptions as Prescription[] | null)?.[0];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-dark-100 font-display">
          Welcome back, {customer.first_name}
        </h1>
        <p className="text-dark-400 text-sm mt-1">Your ARM Optics account</p>
      </div>

      {/* Contact summary */}
      <div className="card p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center text-lg font-medium text-dark-300 flex-shrink-0">
            {customer.first_name[0]}{customer.last_name[0]}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-dark-100">{customer.first_name} {customer.last_name}</p>
            <div className="flex flex-wrap gap-3 mt-1">
              {customer.phone && (
                <span className="flex items-center gap-1 text-xs text-dark-400">
                  <Phone className="w-3 h-3" /> {customer.phone}
                </span>
              )}
              {customer.email && (
                <span className="flex items-center gap-1 text-xs text-dark-400">
                  <Mail className="w-3 h-3" /> {customer.email}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-dark-500" />
              <h2 className="text-sm font-semibold text-dark-200">Recent Orders</h2>
            </div>
            <Link href="/portal/orders" className="text-xs text-gold hover:text-gold-light transition-colors flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {!orders || orders.length === 0 ? (
            <p className="text-sm text-dark-400 p-4">No orders yet.</p>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {(orders as Order[]).map((order) => (
                <div key={order.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-dark-100 tabular-nums">{order.order_number}</p>
                    <p className="text-xs text-dark-400">{formatDate(order.order_date)}</p>
                  </div>
                  <span className={`status-badge ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest Prescription */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-dark-500" />
              <h2 className="text-sm font-semibold text-dark-200">Latest Prescription</h2>
            </div>
            <Link href="/portal/prescriptions" className="text-xs text-gold hover:text-gold-light transition-colors flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {latestRx ? (
            <div>
              <p className="text-xs text-dark-400 mb-3">{formatDate(latestRx.exam_date)}</p>
              <table className="w-full text-xs text-center">
                <thead>
                  <tr>
                    <th className="text-left pb-1.5 text-dark-500 w-8"></th>
                    <th className="pb-1.5 px-2 text-dark-400">SPH</th>
                    <th className="pb-1.5 px-2 text-dark-400">CYL</th>
                    <th className="pb-1.5 px-2 text-dark-400">AXIS</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { eye: "OD", sph: latestRx.od_sph, cyl: latestRx.od_cyl, axis: latestRx.od_axis },
                    { eye: "OS", sph: latestRx.os_sph, cyl: latestRx.os_cyl, axis: latestRx.os_axis },
                  ].map(({ eye, sph, cyl, axis }) => (
                    <tr key={eye} className="border-t border-white/[0.05]">
                      <td className="text-left py-2 text-dark-400 font-semibold">{eye}</td>
                      <td className="py-2 px-2 text-dark-200 tabular-nums">{sph != null ? (sph >= 0 ? `+${sph.toFixed(2)}` : sph.toFixed(2)) : "—"}</td>
                      <td className="py-2 px-2 text-dark-200 tabular-nums">{cyl != null ? (cyl >= 0 ? `+${cyl.toFixed(2)}` : cyl.toFixed(2)) : "—"}</td>
                      <td className="py-2 px-2 text-dark-200">{axis ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-dark-400">No prescriptions on file.</p>
          )}
        </div>
      </div>
    </div>
  );
}
