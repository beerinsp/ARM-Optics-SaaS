"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@/types/database";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderStatusUpdater({ orderId, currentStatus }: Props) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

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
      toast.error("Failed to update status");
    } else {
      toast.success(`Status updated to ${ORDER_STATUS_LABELS[status]}`);
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
        <SelectTrigger className="w-44">
          <div className={`status-badge ${ORDER_STATUS_COLORS[status]} mr-1`}>
            {ORDER_STATUS_LABELS[status]}
          </div>
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
            <SelectItem key={s} value={s}>
              <span className={`status-badge ${ORDER_STATUS_COLORS[s]}`}>{ORDER_STATUS_LABELS[s]}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {status !== currentStatus && (
        <Button size="sm" onClick={handleUpdate} disabled={saving}>
          <CheckCircle className="w-3.5 h-3.5" />
          {saving ? "Saving..." : "Update"}
        </Button>
      )}
    </div>
  );
}
