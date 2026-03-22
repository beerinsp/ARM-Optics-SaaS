"use client";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { CustomerFormValues } from "@/lib/validations/customer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCustomerPage() {
  const router = useRouter();

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
      toast.error("Failed to create customer: " + error.message);
      return;
    }
    toast.success("Customer created successfully");
    router.push(`/customers/${data.id}`);
  };

  return (
    <div>
      <div className="mb-4">
        <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-dark-400 hover:text-dark-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to customers
        </Link>
      </div>
      <PageHeader
        title="New Customer"
        description="Create a new customer profile"
      />
      <div className="max-w-3xl">
        <CustomerForm onSubmit={handleSubmit} submitLabel="Create Customer" />
      </div>
    </div>
  );
}
