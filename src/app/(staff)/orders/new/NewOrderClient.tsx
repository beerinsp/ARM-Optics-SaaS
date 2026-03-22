"use client";
import { useRouter } from "next/navigation";
import { OrderForm } from "@/components/orders/OrderForm";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { type OrderFormValues, orderFormToDbValues } from "@/lib/validations/order";
import type { Customer } from "@/types/database";
import { useLocale } from "@/lib/i18n/context";

interface Props {
  defaultCustomer: Customer | null;
}

export function NewOrderClient({ defaultCustomer }: Props) {
  const router = useRouter();
  const { dict } = useLocale();
  const t = dict.orders;

  const handleSubmit = async (values: OrderFormValues) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const dbValues = orderFormToDbValues(values);

    const { data, error } = await supabase
      .from("orders")
      .insert({
        ...dbValues,
        order_number: "",
        created_by: user?.id,
        updated_by: user?.id,
      })
      .select()
      .single();

    if (error) {
      toast.error(`${t.orderCreateFailed}: ${error.message}`);
      return;
    }
    toast.success(`${t.orderCreated} ${data.order_number}`);
    router.push(`/orders/${data.id}`);
  };

  return (
    <OrderForm
      defaultCustomer={defaultCustomer}
      onSubmit={handleSubmit}
      submitLabel={t.createOrder}
    />
  );
}
