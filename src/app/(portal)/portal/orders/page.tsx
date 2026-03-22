import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate, formatCurrency, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/utils";
import type { Order } from "@/types/database";
import { ShoppingBag } from "lucide-react";

export default async function PortalOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal-login");

  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("portal_user_id", user.id)
    .single();

  if (!customer) redirect("/portal");

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark-100 font-display mb-6">My Orders</h1>
      <div className="card overflow-hidden">
        {!orders || orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-10 h-10 text-dark-700 mx-auto mb-3" />
            <p className="text-dark-400">No orders on record.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {(orders as Order[]).map((order) => (
              <div key={order.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-dark-100 tabular-nums">{order.order_number}</p>
                    <p className="text-xs text-dark-400 mt-0.5">
                      Ordered {formatDate(order.order_date)}
                      {order.collection_date && ` · Collect from ${formatDate(order.collection_date)}`}
                    </p>
                  </div>
                  <span className={`status-badge flex-shrink-0 ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  {order.frame_brand && (
                    <div>
                      <p className="text-xs text-dark-500">Frame</p>
                      <p className="text-dark-300">{order.frame_brand} {order.frame_model}</p>
                    </div>
                  )}
                  {order.lens_type && (
                    <div>
                      <p className="text-xs text-dark-500">Lenses</p>
                      <p className="text-dark-300">{order.lens_type}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-dark-500">Total</p>
                    <p className="text-dark-200 font-medium">{formatCurrency(order.total_price)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-500">Balance Due</p>
                    <p className={`font-medium ${(order.total_price - order.deposit_paid) > 0 ? "text-yellow-300" : "text-green-400"}`}>
                      {formatCurrency(order.total_price - order.deposit_paid)}
                    </p>
                  </div>
                </div>
                {order.notes && (
                  <p className="text-xs text-dark-400 mt-2">{order.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
