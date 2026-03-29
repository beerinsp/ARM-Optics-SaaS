import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n";
import { PageHeader } from "@/components/layout/PageHeader";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewOrderClient } from "./NewOrderClient";
import type { Customer } from "@/types/database";

interface PageProps {
  searchParams: Promise<{ customer?: string }>;
}

export default async function NewOrderPage({ searchParams }: PageProps) {
  const { customer: customerId } = await searchParams;
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.orders;

  const supabase = await createClient();

  let defaultCustomer: Customer | null = null;
  if (customerId) {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();
    defaultCustomer = data;
  }

  return (
    <div>
      <div className="mb-4">
        <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-brand-500 hover:text-brand-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t.backToOrders2}
        </Link>
      </div>
      <PageHeader
        title={t.newOrderTitle}
        description={t.newOrderDescription}
      />
      <NewOrderClient defaultCustomer={defaultCustomer} />
    </div>
  );
}
