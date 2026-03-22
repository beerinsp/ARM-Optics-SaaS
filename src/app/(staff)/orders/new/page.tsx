import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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
        <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-dark-400 hover:text-dark-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to orders
        </Link>
      </div>
      <PageHeader
        title="New Order"
        description="Create a new optical order"
      />
      <NewOrderClient defaultCustomer={defaultCustomer} />
    </div>
  );
}
