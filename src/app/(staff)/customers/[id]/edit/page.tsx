"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { CustomerFormValues } from "@/lib/validations/customer";
import type { Customer } from "@/types/database";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

export default function EditCustomerPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const { dict } = useLocale();
  const t = dict.customers;

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (!data) {
          router.push("/customers");
          return;
        }
        setCustomer(data as Customer);
        setLoading(false);
      });
  }, [id, router]);

  const handleSubmit = async (values: CustomerFormValues) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("customers")
      .update({
        ...values,
        email: values.email || null,
        phone: values.phone || null,
        mobile: values.mobile || null,
        date_of_birth: values.date_of_birth || null,
        dva_number: values.dva_number || null,
        medicare_number: values.medicare_number || null,
        health_fund_name: values.health_fund_name || null,
        health_fund_number: values.health_fund_number || null,
        health_fund_ref: values.health_fund_ref || null,
        notes: values.notes || null,
      })
      .eq("id", id);

    if (error) {
      toast.error(`${t.editCustomerTitle}: ${error.message}`);
      return;
    }
    toast.success(t.editCustomerTitle);
    router.push(`/customers/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div>
      <div className="mb-4">
        <Link
          href={`/customers/${id}`}
          className="inline-flex items-center gap-1 text-sm text-brand-500 hover:text-brand-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {customer.first_name} {customer.last_name}
        </Link>
      </div>
      <PageHeader
        title={`${t.editCustomerTitle} — ${customer.first_name} ${customer.last_name}`}
        description={t.editCustomerDescription}
      />
      <div className="max-w-3xl">
        <CustomerForm
          defaultValues={customer}
          onSubmit={handleSubmit}
          submitLabel={t.saveCustomer}
        />
      </div>
    </div>
  );
}
