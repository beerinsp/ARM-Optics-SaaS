import { createClient } from "@/lib/supabase/server";
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
          className="inline-flex items-center gap-1 text-sm text-dark-400 hover:text-dark-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to order
        </Link>
      </div>
      <PageHeader
        title={`Edit — ${o.order_number}`}
        description={`Update order details`}
      />
      <EditOrderClient order={o} />
    </div>
  );
}
