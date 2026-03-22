"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema, type CustomerFormValues } from "@/lib/validations/customer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2 } from "lucide-react";
import type { Customer } from "@/types/database";

const AU_STATES = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];

interface CustomerFormProps {
  defaultValues?: Partial<Customer>;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
  submitLabel?: string;
}

export function CustomerForm({ defaultValues, onSubmit, submitLabel = "Save Customer" }: CustomerFormProps) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      first_name: defaultValues?.first_name ?? "",
      last_name: defaultValues?.last_name ?? "",
      date_of_birth: defaultValues?.date_of_birth ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      mobile: defaultValues?.mobile ?? "",
      address_line1: defaultValues?.address_line1 ?? "",
      address_line2: defaultValues?.address_line2 ?? "",
      suburb: defaultValues?.suburb ?? "",
      state: defaultValues?.state ?? "",
      postcode: defaultValues?.postcode ?? "",
      country: defaultValues?.country ?? "Australia",
      medicare_number: defaultValues?.medicare_number ?? "",
      dva_number: defaultValues?.dva_number ?? "",
      health_fund_name: defaultValues?.health_fund_name ?? "",
      health_fund_number: defaultValues?.health_fund_number ?? "",
      health_fund_ref: defaultValues?.health_fund_ref ?? "",
      notes: defaultValues?.notes ?? "",
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Information */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-dark-200 mb-4 pb-2 border-b border-white/[0.06]">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="first_name">First Name *</Label>
            <Input id="first_name" {...register("first_name")} placeholder="John" />
            {errors.first_name && <p className="text-xs text-red-400">{errors.first_name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="last_name">Last Name *</Label>
            <Input id="last_name" {...register("last_name")} placeholder="Smith" />
            {errors.last_name && <p className="text-xs text-red-400">{errors.last_name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input id="date_of_birth" type="date" {...register("date_of_birth")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" {...register("email")} placeholder="john@example.com" />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" {...register("phone")} placeholder="(02) 9000 0000" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mobile">Mobile</Label>
            <Input id="mobile" type="tel" {...register("mobile")} placeholder="0400 000 000" />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-dark-200 mb-4 pb-2 border-b border-white/[0.06]">
          Address
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="address_line1">Street Address</Label>
            <Input id="address_line1" {...register("address_line1")} placeholder="123 Main Street" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address_line2">Address Line 2</Label>
            <Input id="address_line2" {...register("address_line2")} placeholder="Unit, Apt, etc." />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="suburb">Suburb</Label>
              <Input id="suburb" {...register("suburb")} placeholder="Sydney" />
            </div>
            <div className="space-y-1.5">
              <Label>State</Label>
              <Select
                value={watch("state") ?? ""}
                onValueChange={(v) => setValue("state", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  {AU_STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="postcode">Postcode</Label>
              <Input id="postcode" {...register("postcode")} placeholder="2000" maxLength={4} />
            </div>
          </div>
        </div>
      </div>

      {/* Health Fund / Medicare */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-dark-200 mb-4 pb-2 border-b border-white/[0.06]">
          Health Fund & Medicare
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="medicare_number">Medicare Number</Label>
            <Input id="medicare_number" {...register("medicare_number")} placeholder="XXXX XXXXX X" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dva_number">DVA Number</Label>
            <Input id="dva_number" {...register("dva_number")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="health_fund_name">Health Fund</Label>
            <Input id="health_fund_name" {...register("health_fund_name")} placeholder="e.g. BUPA, Medibank" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="health_fund_number">Member Number</Label>
            <Input id="health_fund_number" {...register("health_fund_number")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="health_fund_ref">Reference / Sub-number</Label>
            <Input id="health_fund_ref" {...register("health_fund_ref")} />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-dark-200 mb-4 pb-2 border-b border-white/[0.06]">
          Notes
        </h3>
        <textarea
          className="input-base w-full h-24 resize-none"
          placeholder="Any relevant notes about this customer..."
          {...register("notes")}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4" /> {submitLabel}</>
          )}
        </Button>
      </div>
    </form>
  );
}
