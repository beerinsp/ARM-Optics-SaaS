import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatCurrency, formatDate, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/utils";
import Link from "next/link";
import { Users, ShoppingBag, Clock, CheckCircle, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderWithCustomer } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];

  // Parallel data fetches
  const [
    { count: totalCustomers },
    { count: pendingOrders },
    { count: readyOrders },
    { data: recentOrders },
    { data: staffProfile },
  ] = await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "ready"),
    supabase
      .from("orders")
      .select("*, customers(id, first_name, last_name, phone, mobile, email)")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("staff_profiles")
      .select("full_name, role")
      .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "")
      .single(),
  ]);

  const orders = (recentOrders ?? []) as OrderWithCustomer[];

  const stats = [
    {
      label: "Total Customers",
      value: totalCustomers ?? 0,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Pending Orders",
      value: pendingOrders ?? 0,
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/20",
    },
    {
      label: "Ready for Collection",
      value: readyOrders ?? 0,
      icon: CheckCircle,
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/20",
    },
    {
      label: "Orders Today",
      value: orders.filter((o) => o.order_date === today).length,
      icon: ShoppingBag,
      color: "text-gold",
      bg: "bg-gold/10 border-gold/20",
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Good ${getTimeOfDay()}, ${staffProfile?.full_name?.split(" ")[0] ?? "there"}`}
        description={`Today is ${formatDate(today)}`}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/customers/new">
                <Plus className="w-4 h-4" /> New Customer
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/orders/new">
                <Plus className="w-4 h-4" /> New Order
              </Link>
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`card p-5 border ${bg}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-dark-400 font-medium">{label}</p>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-3xl font-bold font-display ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <h2 className="text-base font-semibold text-dark-100">Recent Orders</h2>
          <Link
            href="/orders"
            className="text-xs text-gold hover:text-gold-light flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-dark-400 text-sm">
              No orders yet.{" "}
              <Link href="/orders/new" className="text-gold hover:underline">
                Create the first one
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium text-dark-100 group-hover:text-gold transition-colors">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-dark-400">
                      {order.customers?.first_name} {order.customers?.last_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div className="hidden sm:block">
                    <p className="text-sm text-dark-200">{formatCurrency(order.total_price)}</p>
                    <p className="text-xs text-dark-400">{formatDate(order.order_date)}</p>
                  </div>
                  <span
                    className={`status-badge ${ORDER_STATUS_COLORS[order.status]}`}
                  >
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
