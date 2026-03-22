"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderFormSchema, type OrderFormValues } from "@/lib/validations/order";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LensSection } from "./LensSection";
import { FrameSection } from "./FrameSection";
import { PricingSection } from "./PricingSection";
import { CustomerSearchBar } from "@/components/customers/CustomerSearchBar";
import { Save, Loader2, User } from "lucide-react";
import type { Customer, Order } from "@/types/database";
import { useState } from "react";

interface OrderFormProps {
  defaultCustomer?: Customer | null;
  defaultValues?: Partial<Order>;
  onSubmit: (values: OrderFormValues) => Promise<void>;
  submitLabel?: string;
}

export function OrderForm({ defaultCustomer, defaultValues, onSubmit, submitLabel = "Save Order" }: OrderFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(defaultCustomer ?? null);
  const today = new Date().toISOString().split("T")[0];

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customer_id: defaultCustomer?.id ?? defaultValues?.customer_id ?? "",
      order_date: defaultValues?.order_date ?? today,
      status: defaultValues?.status ?? "pending",
      total_price: defaultValues?.total_price ?? 0,
      deposit_paid: defaultValues?.deposit_paid ?? 0,
      services: defaultValues?.services ?? [],
      accessories: defaultValues?.accessories ?? [],
      customer_acknowledged: defaultValues?.customer_acknowledged ?? false,
      lens_od_sph: defaultValues?.lens_od_sph?.toString() ?? "",
      lens_od_cyl: defaultValues?.lens_od_cyl?.toString() ?? "",
      lens_od_axis: defaultValues?.lens_od_axis?.toString() ?? "",
      lens_od_add: defaultValues?.lens_od_add?.toString() ?? "",
      lens_os_sph: defaultValues?.lens_os_sph?.toString() ?? "",
      lens_os_cyl: defaultValues?.lens_os_cyl?.toString() ?? "",
      lens_os_axis: defaultValues?.lens_os_axis?.toString() ?? "",
      lens_os_add: defaultValues?.lens_os_add?.toString() ?? "",
      pd_distance_right: defaultValues?.pd_distance_right?.toString() ?? "",
      pd_distance_left: defaultValues?.pd_distance_left?.toString() ?? "",
      pd_near_right: defaultValues?.pd_near_right?.toString() ?? "",
      pd_near_left: defaultValues?.pd_near_left?.toString() ?? "",
      pd_single: defaultValues?.pd_single?.toString() ?? "",
      frame_brand: defaultValues?.frame_brand ?? "",
      frame_model: defaultValues?.frame_model ?? "",
      frame_colour: defaultValues?.frame_colour ?? "",
      frame_size: defaultValues?.frame_size ?? "",
      frame_supplier: defaultValues?.frame_supplier ?? "",
      frame_gensoft_sku: defaultValues?.frame_gensoft_sku ?? "",
      lens_type: defaultValues?.lens_type ?? "",
      lens_material: defaultValues?.lens_material ?? "",
      lens_coating: defaultValues?.lens_coating ?? "",
      lens_supplier: defaultValues?.lens_supplier ?? "",
      lens_gensoft_sku: defaultValues?.lens_gensoft_sku ?? "",
      lab_name: defaultValues?.lab_name ?? "",
      lab_order_ref: defaultValues?.lab_order_ref ?? "",
      notes: defaultValues?.notes ?? "",
      internal_notes: defaultValues?.internal_notes ?? "",
    },
  });

  const { handleSubmit, setValue, formState: { isSubmitting, errors } } = form;

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setValue("customer_id", customer.id, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer Selection */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-dark-200 mb-4 pb-2 border-b border-white/[0.06]">
          Customer
        </h3>
        {selectedCustomer ? (
          <div className="flex items-center justify-between p-3 bg-dark-900/60 rounded-lg border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-sm font-medium text-dark-300">
                {selectedCustomer.first_name[0]}{selectedCustomer.last_name[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-dark-100">
                  {selectedCustomer.first_name} {selectedCustomer.last_name}
                </p>
                <p className="text-xs text-dark-400">
                  {selectedCustomer.phone || selectedCustomer.mobile}
                  {selectedCustomer.email && ` · ${selectedCustomer.email}`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCustomer(null);
                setValue("customer_id", "");
              }}
              className="text-xs text-dark-500 hover:text-red-400 transition-colors"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Search for customer</Label>
            <CustomerSearchBar
              navigateOnSelect={false}
              onSelect={handleCustomerSelect}
              placeholder="Search by name, phone, or email..."
            />
            {errors.customer_id && (
              <p className="text-xs text-red-400">{errors.customer_id.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Order Form Tabs */}
      <Tabs defaultValue="prescription" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="prescription">Prescription & Lenses</TabsTrigger>
          <TabsTrigger value="frame">Frame & Accessories</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Lab</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="prescription">
          <div className="card p-5">
            <LensSection form={form} />
          </div>
        </TabsContent>

        <TabsContent value="frame">
          <div className="card p-5">
            <FrameSection form={form} />
          </div>
        </TabsContent>

        <TabsContent value="pricing">
          <div className="card p-5">
            <PricingSection form={form} />
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <div className="card p-5 space-y-4">
            <div className="space-y-1.5">
              <Label>Customer Notes</Label>
              <textarea
                className="input-base w-full h-28 resize-none"
                placeholder="Notes visible to the customer..."
                {...form.register("notes")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Internal Notes</Label>
              <textarea
                className="input-base w-full h-28 resize-none"
                placeholder="Staff-only notes (not shown to customer)..."
                {...form.register("internal_notes")}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} size="lg">
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
