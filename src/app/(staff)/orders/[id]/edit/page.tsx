import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EditOrderClient } from "./EditOrderClient";
import type { OrderWithDetails } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditOrderPage({ params }: PageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.orders;

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, customers(*), prescriptions(*)")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const o = order as OrderWithDetails;

  return (
    <div>
      <div className="mb-4">
        <Link
          href={`/orders/${id}`}
          className="inline-flex items-center gap-1 text-sm text-brand-500 hover:text-brand-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t.backToOrders}
        </Link>
      </div>
      <PageHeader
        title={`${t.editOrderTitle} — ${o.order_number}`}
        description={t.editOrderDescription}
      />
      <EditOrderClient order={o} />
    </div>
  );
}
