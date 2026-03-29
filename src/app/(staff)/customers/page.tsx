import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { CustomerSearchBar } from "@/components/customers/CustomerSearchBar";
import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Customer } from "@/types/database";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const { q, page = "1" } = await searchParams;
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.customers;

  const supabase = await createClient();
  const pageSize = 20;
  const offset = (parseInt(page) - 1) * pageSize;

  let query = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .order("last_name")
    .range(offset, offset + pageSize - 1);

  if (q) {
    query = query.or(
      `phone.ilike.%${q}%,mobile.ilike.%${q}%,email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`
    );
  }

  const { data: customers, count } = await query;

  return (
    <div>
      <PageHeader
        title={t.title}
        description={t.description}
        actions={
          <Button asChild size="sm">
            <Link href="/customers/new">
              <Plus className="w-4 h-4" /> {t.newCustomer}
            </Link>
          </Button>
        }
      />

      <div className="mb-6">
        <CustomerSearchBar navigateOnSelect={true} />
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-100">
          <p className="text-sm text-brand-500">
            {count ?? 0} {count !== 1 ? t.countPlural : t.count}
          </p>
        </div>

        {!customers || customers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-brand-500 text-sm mb-3">{t.noCustomers}</p>
            <Button asChild size="sm">
              <Link href="/customers/new">
                <Plus className="w-4 h-4" /> {t.addFirst}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-brand-100">
            {(customers as Customer[]).map((customer) => (
              <Link
                key={customer.id}
                href={`/customers/${customer.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-brand-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-sm font-medium text-brand-700 flex-shrink-0">
                    {customer.first_name[0]}{customer.last_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-900 group-hover:text-accent transition-colors">
                      {customer.first_name} {customer.last_name}
                    </p>
                    <p className="text-xs text-brand-500">
                      {customer.phone || customer.mobile}
                      {customer.email && ` · ${customer.email}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div className="hidden sm:block">
                    <p className="text-xs text-brand-500">{customer.suburb}</p>
                    <p className="text-xs text-brand-400">
                      {t.added} {formatDate(customer.created_at)}
                    </p>
                  </div>
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
