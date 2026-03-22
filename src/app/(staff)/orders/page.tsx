import { createClient } from "@/lib/supabase/server";
import { getLocale, getDict } from "@/lib/i18n";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { formatDate, formatCurrency, ORDER_STATUS_COLORS } from "@/lib/utils";
import type { OrderWithCustomer } from "@/types/database";

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const { status, page = "1" } = await searchParams;
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.orders;

  const supabase = await createClient();
  const pageSize = 25;
  const offset = (parseInt(page) - 1) * pageSize;

  let query = supabase
    .from("orders")
    .select("*, customers(id, first_name, last_name, phone, mobile, email)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (status) {
    query = query.eq("status", status);
  }

  const { data: orders, count } = await query;

  const statuses = [
    { value: "",            label: t.filterAll },
    { value: "pending",     label: t.filterPending },
    { value: "in_progress", label: t.filterInProgress },
    { value: "lab_sent",    label: t.filterLabSent },
    { value: "ready",       label: t.filterReady },
    { value: "collected",   label: t.filterCollected },
  ];

  return (
    <div>
      <PageHeader
        title={t.title}
        description={t.description}
        actions={
          <Button asChild size="sm">
            <Link href="/orders/new">
              <Plus className="w-4 h-4" /> {t.newOrder}
            </Link>
          </Button>
        }
      />

      {/* Status Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {statuses.map(({ value, label }) => (
          <Link
            key={value}
            href={value ? `/orders?status=${value}` : "/orders"}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              status === value || (!status && !value)
                ? "bg-accent/10 text-accent border-accent/20"
                : "text-brand-500 border-brand-100 hover:text-brand-800 hover:border-brand-200"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-100">
          <p className="text-sm text-brand-500">
            {count ?? 0} {count !== 1 ? t.countPlural : t.count}
          </p>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-brand-500 text-sm mb-3">{t.noOrders}</p>
            <Button asChild size="sm">
              <Link href="/orders/new"><Plus className="w-4 h-4" /> {t.createFirst}</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-brand-100">
            {(orders as OrderWithCustomer[]).map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-brand-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-semibold text-brand-900 group-hover:text-accent transition-colors tabular-nums">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-brand-500">
                      {order.customers?.first_name} {order.customers?.last_name}
                      {order.customers?.phone && ` · ${order.customers.phone}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden md:block text-right">
                    <p className="text-sm text-brand-800">{formatCurrency(order.total_price)}</p>
                    <p className="text-xs text-brand-500">
                      {t.deposit}: {formatCurrency(order.deposit_paid)}
                    </p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-xs text-brand-500">{formatDate(order.order_date)}</p>
                    {order.collection_date && (
                      <p className="text-xs text-brand-400">
                        {t.collect}: {formatDate(order.collection_date)}
                      </p>
                    )}
                  </div>
                  <span className={`status-badge ${ORDER_STATUS_COLORS[order.status]}`}>
                    {dict.enums.orderStatus[order.status as keyof typeof dict.enums.orderStatus] ?? order.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-brand-300 group-hover:text-accent transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
