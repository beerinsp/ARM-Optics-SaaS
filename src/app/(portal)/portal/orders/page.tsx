import { createClient } from "@/lib/supabase/server";
import { getLocale, getDict } from "@/lib/i18n";
import { redirect } from "next/navigation";
import { formatDate, formatCurrency, ORDER_STATUS_COLORS } from "@/lib/utils";
import type { Order } from "@/types/database";
import { ShoppingBag } from "lucide-react";

export default async function PortalOrdersPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.portal;

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
      <h1 className="text-2xl font-bold text-brand-900 font-display mb-6">{t.myOrders}</h1>
      <div className="card overflow-hidden">
        {!orders || orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-10 h-10 text-brand-400 mx-auto mb-3" />
            <p className="text-brand-500">{t.noOrdersOnRecord}</p>
          </div>
        ) : (
          <div className="divide-y divide-brand-100">
            {(orders as Order[]).map((order) => (
              <div key={order.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-brand-900 tabular-nums">{order.order_number}</p>
                    <p className="text-xs text-brand-500 mt-0.5">
                      {t.orderedOn} {formatDate(order.order_date)}
                      {order.collection_date && ` · ${t.collectFrom} ${formatDate(order.collection_date)}`}
                    </p>
                  </div>
                  <span className={`status-badge flex-shrink-0 ${ORDER_STATUS_COLORS[order.status]}`}>
                    {dict.enums.orderStatus[order.status as keyof typeof dict.enums.orderStatus] ?? order.status}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  {order.frame_brand && (
                    <div>
                      <p className="text-xs text-brand-400">{t.frameLabel}</p>
                      <p className="text-brand-700">{order.frame_brand} {order.frame_model}</p>
                    </div>
                  )}
                  {order.lens_type && (
                    <div>
                      <p className="text-xs text-brand-400">{t.lensesLabel}</p>
                      <p className="text-brand-700">{order.lens_type}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-brand-400">{t.totalLabel}</p>
                    <p className="text-brand-800 font-medium">{formatCurrency(order.total_price)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-400">{t.balanceDue}</p>
                    <p className={`font-medium ${(order.total_price - order.deposit_paid) > 0 ? "text-yellow-300" : "text-green-400"}`}>
                      {formatCurrency(order.total_price - order.deposit_paid)}
                    </p>
                  </div>
                </div>
                {order.notes && (
                  <p className="text-xs text-brand-500 mt-2">{order.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
