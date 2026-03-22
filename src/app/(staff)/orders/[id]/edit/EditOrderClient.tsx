"use client";
import { useRouter } from "next/navigation";
import { OrderForm } from "@/components/orders/OrderForm";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { type OrderFormValues, orderFormToDbValues } from "@/lib/validations/order";
import type { OrderWithDetails } from "@/types/database";

interface Props {
  order: OrderWithDetails;
}

export function EditOrderClient({ order }: Props) {
  const router = useRouter();

  const handleSubmit = async (values: OrderFormValues) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const dbValues = orderFormToDbValues(values);

    const { error } = await supabase
      .from("orders")
      .update({
        ...dbValues,
        updated_by: user?.id,
        customer_acknowledged: values.customer_acknowledged,
        acknowledged_at:
          values.customer_acknowledged && !order.customer_acknowledged
            ? new Date().toISOString()
            : order.acknowledged_at,
      })
      .eq("id", order.id);

    if (error) {
      toast.error("Failed to update order: " + error.message);
      return;
    }
    toast.success("Order updated");
    router.push(`/orders/${order.id}`);
    router.refresh();
  };

  return (
    <OrderForm
      defaultCustomer={order.customers}
      defaultValues={order}
      onSubmit={handleSubmit}
      submitLabel="Save Changes"
    />
  );
}
