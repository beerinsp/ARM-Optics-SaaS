"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@/types/database";
import { ORDER_STATUS_COLORS } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderStatusUpdater({ orderId, currentStatus }: Props) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { dict } = useLocale();
  const t = dict.orders;

  const handleUpdate = async () => {
    if (status === currentStatus) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_by: user?.id })
      .eq("id", orderId);

    if (error) {
      toast.error(t.statusUpdateFailed);
    } else {
      const statusLabel = dict.enums.orderStatus[status as keyof typeof dict.enums.orderStatus] ?? status;
      toast.success(`${t.statusUpdatedTo} ${statusLabel}`);
      if (status === "ready") {
        const res = await fetch(`/api/orders/${orderId}/notify-ready`, { method: "POST" });
        if (res.ok) {
          toast.success(t.customerNotified);
        } else {
          const body = await res.json().catch(() => ({}));
          toast.error(body.error ?? t.notificationFailed);
        }
      }
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
        <SelectTrigger className="w-44">
          <div className={`status-badge ${ORDER_STATUS_COLORS[status]} mr-1`}>
            {dict.enums.orderStatus[status as keyof typeof dict.enums.orderStatus] ?? status}
          </div>
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(dict.enums.orderStatus) as OrderStatus[]).map((s) => (
            <SelectItem key={s} value={s}>
              <span className={`status-badge ${ORDER_STATUS_COLORS[s]}`}>
                {dict.enums.orderStatus[s as keyof typeof dict.enums.orderStatus]}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {status !== currentStatus && (
        <Button size="sm" onClick={handleUpdate} disabled={saving}>
          <CheckCircle className="w-3.5 h-3.5" />
          {saving ? t.statusSaving : t.updateStatus}
        </Button>
      )}
    </div>
  );
}
