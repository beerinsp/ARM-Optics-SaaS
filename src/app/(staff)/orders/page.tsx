import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { formatDate, formatCurrency, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/utils";
import type { OrderWithCustomer } from "@/types/database";

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const { status, page = "1" } = await searchParams;
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
    { value: "", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "lab_sent", label: "Lab Sent" },
    { value: "ready", label: "Ready" },
    { value: "collected", label: "Collected" },
  ];

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Manage all optical orders"
        actions={
          <Button asChild size="sm">
            <Link href="/orders/new">
              <Plus className="w-4 h-4" /> New Order
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
                ? "bg-gold/10 text-gold border-gold/20"
                : "text-dark-400 border-white/5 hover:text-dark-200 hover:border-white/10"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <p className="text-sm text-dark-400">
            {count ?? 0} order{count !== 1 ? "s" : ""}
          </p>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-dark-400 text-sm mb-3">No orders found.</p>
            <Button asChild size="sm">
              <Link href="/orders/new"><Plus className="w-4 h-4" /> Create first order</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {(orders as OrderWithCustomer[]).map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-semibold text-dark-100 group-hover:text-gold transition-colors tabular-nums">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-dark-400">
                      {order.customers?.first_name} {order.customers?.last_name}
                      {order.customers?.phone && ` · ${order.customers.phone}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden md:block text-right">
                    <p className="text-sm text-dark-200">{formatCurrency(order.total_price)}</p>
                    <p className="text-xs text-dark-400">
                      Dep: {formatCurrency(order.deposit_paid)}
                    </p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-xs text-dark-400">{formatDate(order.order_date)}</p>
                    {order.collection_date && (
                      <p className="text-xs text-dark-500">
                        Collect: {formatDate(order.collection_date)}
                      </p>
                    )}
                  </div>
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
  );
}
