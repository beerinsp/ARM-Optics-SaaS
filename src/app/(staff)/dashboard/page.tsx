import { createClient } from "@/lib/supabase/server";
import { getLocale, getDict } from "@/lib/i18n";
import { formatCurrency, formatDate, ORDER_STATUS_COLORS } from "@/lib/utils";
import Link from "next/link";
import { Users, ShoppingBag, Clock, CheckCircle, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderWithCustomer } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.dashboard;

  const today = new Date().toISOString().split("T")[0];

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
  const ordersToday = orders.filter((o) => o.order_date === today).length;

  const stats = [
    {
      label: t.totalCustomers,
      value: totalCustomers ?? 0,
      icon: Users,
      valueColor: "text-blue-700",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      cardBorder: "border-l-blue-400",
    },
    {
      label: t.pendingOrders,
      value: pendingOrders ?? 0,
      icon: Clock,
      valueColor: "text-amber-700",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      cardBorder: "border-l-amber-400",
    },
    {
      label: t.readyForCollection,
      value: readyOrders ?? 0,
      icon: CheckCircle,
      valueColor: "text-green-700",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      cardBorder: "border-l-green-400",
    },
    {
      label: t.ordersToday,
      value: ordersToday,
      icon: ShoppingBag,
      valueColor: "text-brand-700",
      iconBg: "bg-brand-100",
      iconColor: "text-brand-600",
      cardBorder: "border-l-brand-400",
    },
  ];

  const firstName = staffProfile?.full_name?.split(" ")[0] ?? "there";

  const readyCount = readyOrders ?? 0;

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-900 font-display">
            {getGreeting(t)}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-brand-500">
            {formatDate(today)} &mdash; {t.practiceOverview}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/customers/new">
              <Plus className="w-4 h-4" /> {t.newCustomer}
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/orders/new">
              <Plus className="w-4 h-4" /> {t.newOrder}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, valueColor, iconBg, iconColor, cardBorder }) => (
          <div key={label} className={`card p-5 border-l-4 ${cardBorder}`}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">{label}</p>
              <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
            </div>
            <p className={`text-3xl font-bold font-display ${valueColor}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <Link
          href="/customers/new"
          className="card p-4 flex items-center gap-3 hover:border-brand-200 hover:shadow-md transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
            <Users className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-800">{t.addCustomer}</p>
            <p className="text-xs text-brand-400">{t.registerPatient}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-brand-300 ml-auto group-hover:text-brand-500 transition-colors" />
        </Link>

        <Link
          href="/orders/new"
          className="card p-4 flex items-center gap-3 hover:border-brand-200 hover:shadow-md transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
            <ShoppingBag className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-800">{t.newOrder}</p>
            <p className="text-xs text-brand-400">{t.createFrameOrder}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-brand-300 ml-auto group-hover:text-brand-500 transition-colors" />
        </Link>

        <Link
          href="/orders?status=ready"
          className="card p-4 flex items-center gap-3 hover:border-brand-200 hover:shadow-md transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-800">{t.readyForCollectionAction}</p>
            <p className="text-xs text-brand-400">
              {readyCount} {readyCount !== 1 ? t.ordersWaiting : t.orderWaiting}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-brand-300 ml-auto group-hover:text-brand-500 transition-colors" />
        </Link>
      </div>

      {/* Recent orders */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-100">
          <h2 className="text-base font-semibold text-brand-900 font-display">{t.recentOrders}</h2>
          <Link
            href="/orders"
            className="text-xs text-brand-500 hover:text-brand-700 flex items-center gap-1 transition-colors font-medium"
          >
            {dict.common.viewAll} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-6 h-6 text-brand-300" />
            </div>
            <p className="text-sm font-medium text-brand-700 mb-1">{t.noOrdersYet}</p>
            <p className="text-xs text-brand-400 mb-4">{t.noOrdersDescription}</p>
            <Button asChild size="sm">
              <Link href="/orders/new">
                <Plus className="w-4 h-4" /> {t.createFirstOrder}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-brand-50">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2.5 bg-brand-50/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">{t.orderCustomer}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-400 text-right w-24">{t.total}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-400 text-right w-24">{t.date}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-400 text-right w-28">{t.status}</p>
            </div>

            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-brand-50/60 transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-brand-800 group-hover:text-brand-600 transition-colors">
                    {order.order_number}
                  </p>
                  <p className="text-xs text-brand-400">
                    {order.customers?.first_name} {order.customers?.last_name}
                  </p>
                </div>
                <p className="text-sm text-brand-700 text-right w-24 tabular-nums">
                  {formatCurrency(order.total_price)}
                </p>
                <p className="text-xs text-brand-400 text-right w-24">
                  {formatDate(order.order_date)}
                </p>
                <div className="flex justify-end w-28">
                  <span className={`status-badge ${ORDER_STATUS_COLORS[order.status]}`}>
                    {dict.enums.orderStatus[order.status as keyof typeof dict.enums.orderStatus] ?? order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting(t: ReturnType<typeof getDict>["dashboard"]): string {
  const hour = new Date().getHours();
  if (hour < 12) return t.greetingMorning;
  if (hour < 17) return t.greetingAfternoon;
  return t.greetingEvening;
}
