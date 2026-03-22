"use client";
import { type UseFormReturn, useWatch } from "react-hook-form";
import type { OrderFormValues } from "@/lib/validations/order";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PricingSectionProps {
  form: UseFormReturn<OrderFormValues>;
}

export function PricingSection({ form }: PricingSectionProps) {
  const { register, setValue, watch, formState: { errors } } = form;

  const totalPrice = useWatch({ control: form.control, name: "total_price" }) ?? 0;
  const depositPaid = useWatch({ control: form.control, name: "deposit_paid" }) ?? 0;
  const balance = (totalPrice - depositPaid);

  return (
    <div className="space-y-5">
      {/* Order Meta */}
      <div>
        <h4 className="section-label mb-3">Order Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="order_date">Order Date *</Label>
            <Input id="order_date" type="date" {...register("order_date")} />
            {errors.order_date && <p className="text-xs text-red-400">{errors.order_date.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="collection_date">Est. Collection Date</Label>
            <Input id="collection_date" type="date" {...register("collection_date")} />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={watch("status")}
              onValueChange={(v) => setValue("status", v as OrderFormValues["status"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="lab_sent">Lab Sent</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="collected">Collected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h4 className="section-label mb-3">Pricing</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="total_price">Total Price *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 text-sm">$</span>
              <Input
                id="total_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="pl-7"
                {...register("total_price", { valueAsNumber: true })}
              />
            </div>
            {errors.total_price && <p className="text-xs text-red-400">{errors.total_price.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deposit_paid">Deposit Paid</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 text-sm">$</span>
              <Input
                id="deposit_paid"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="pl-7"
                {...register("deposit_paid", { valueAsNumber: true })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Balance Due</Label>
            <div className={`input-base flex items-center font-semibold tabular-nums ${balance > 0 ? "text-yellow-300" : "text-green-400"}`}>
              {formatCurrency(balance)}
            </div>
          </div>
        </div>
      </div>

      {/* Lab */}
      <div>
        <h4 className="section-label mb-3">Laboratory</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Lab Name</Label>
            <Input placeholder="e.g. OPSM Lab, Rx Optical" {...register("lab_name")} />
          </div>
          <div className="space-y-1.5">
            <Label>Lab Order Ref</Label>
            <Input placeholder="Lab reference number" {...register("lab_order_ref")} />
          </div>
          <div className="space-y-1.5">
            <Label>Date Sent to Lab</Label>
            <Input type="date" {...register("lab_sent_date")} />
          </div>
        </div>
      </div>

      {/* Acknowledgement */}
      <div className="bg-dark-900/60 rounded-lg p-4 border border-white/[0.06]">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 accent-[#c9a84c] w-4 h-4 flex-shrink-0"
            {...register("customer_acknowledged")}
          />
          <div>
            <p className="text-sm font-medium text-dark-200">Customer Acknowledgement</p>
            <p className="text-xs text-dark-400 mt-1">
              The customer has reviewed and agreed to the order details, pricing, and any applicable terms.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}
