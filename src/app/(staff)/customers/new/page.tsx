"use client";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { CustomerFormValues } from "@/lib/validations/customer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

export default function NewCustomerPage() {
  const router = useRouter();
  const { dict } = useLocale();
  const t = dict.customers;

  const handleSubmit = async (values: CustomerFormValues) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("customers")
      .insert({
        ...values,
        email: values.email || null,
        phone: values.phone || null,
        mobile: values.mobile || null,
        date_of_birth: values.date_of_birth || null,
      })
      .select()
      .single();

    if (error) {
      toast.error(`${t.newCustomerTitle}: ${error.message}`);
      return;
    }
    toast.success(t.newCustomerTitle);
    router.push(`/customers/${data.id}`);
  };

  return (
    <div>
      <div className="mb-4">
        <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-brand-500 hover:text-brand-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t.backToCustomers}
        </Link>
      </div>
      <PageHeader
        title={t.newCustomerTitle}
        description={t.newCustomerDescription}
      />
      <div className="max-w-3xl">
        <CustomerForm onSubmit={handleSubmit} submitLabel={t.saveCustomer} />
      </div>
    </div>
  );
}
