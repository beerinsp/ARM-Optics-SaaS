"use client";
import { type UseFormReturn, useWatch } from "react-hook-form";
import type { OrderFormValues } from "@/lib/validations/order";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocale } from "@/lib/i18n/context";

interface PricingSectionProps {
  form: UseFormReturn<OrderFormValues>;
}

export function PricingSection({ form }: PricingSectionProps) {
  const { register, setValue, watch, formState: { errors } } = form;
  const { dict } = useLocale();
  const t = dict.orders;

  const totalPrice = useWatch({ control: form.control, name: "total_price" }) ?? 0;
  const depositPaid = useWatch({ control: form.control, name: "deposit_paid" }) ?? 0;
  const balance = (totalPrice - depositPaid);

  return (
    <div className="space-y-5">
      {/* Order Meta */}
      <div>
        <h4 className="section-label mb-3">{t.orderDetails}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="order_date">{t.orderDate2} *</Label>
            <Input id="order_date" type="date" {...register("order_date")} />
            {errors.order_date && <p className="text-xs text-red-400">{errors.order_date.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="collection_date">{t.estCollectionDate}</Label>
            <Input id="collection_date" type="date" {...register("collection_date")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t.status}</Label>
            <Select
              value={watch("status")}
              onValueChange={(v) => setValue("status", v as OrderFormValues["status"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(dict.enums.orderStatus) as [string, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h4 className="section-label mb-3">{t.pricing}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="total_price">{t.totalPrice} *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-500 text-sm">$</span>
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
            <Label htmlFor="deposit_paid">{t.depositPaid}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-500 text-sm">$</span>
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
            <Label>{t.balanceDue}</Label>
            <div className={`input-base flex items-center font-semibold tabular-nums ${balance > 0 ? "text-yellow-300" : "text-green-400"}`}>
              {formatCurrency(balance)}
            </div>
          </div>
        </div>
      </div>

      {/* Lab */}
      <div>
        <h4 className="section-label mb-3">{t.laboratory}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>{t.labName}</Label>
            <Input placeholder="e.g. OPSM Lab, Rx Optical" {...register("lab_name")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t.labOrderRef}</Label>
            <Input placeholder="Lab reference number" {...register("lab_order_ref")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t.dateSentToLab}</Label>
            <Input type="date" {...register("lab_sent_date")} />
          </div>
        </div>
      </div>

      {/* Acknowledgement */}
      <div className="bg-brand-50 rounded-lg p-4 border border-brand-100">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 accent-[#c9a84c] w-4 h-4 flex-shrink-0"
            {...register("customer_acknowledged")}
          />
          <div>
            <p className="text-sm font-medium text-brand-800">{t.customerAcknowledgement}</p>
            <p className="text-xs text-brand-500 mt-1">
              {t.acknowledgementDescription}
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}
