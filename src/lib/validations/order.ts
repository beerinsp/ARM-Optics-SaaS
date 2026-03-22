import { z } from "zod";

// Raw form values (string fields for rx inputs)
export const orderFormSchema = z.object({
  customer_id: z.string().min(1, "Please select a customer"),
  prescription_id: z.string().optional().nullable(),
  order_date: z.string().min(1, "Order date is required"),
  collection_date: z.string().optional().nullable(),
  status: z.enum(["pending", "in_progress", "lab_sent", "ready", "collected", "cancelled"]).default("pending"),

  // Lens Rx - stored as strings in the form
  lens_od_sph: z.string().optional().nullable(),
  lens_od_cyl: z.string().optional().nullable(),
  lens_od_axis: z.string().optional().nullable(),
  lens_od_add: z.string().optional().nullable(),
  lens_os_sph: z.string().optional().nullable(),
  lens_os_cyl: z.string().optional().nullable(),
  lens_os_axis: z.string().optional().nullable(),
  lens_os_add: z.string().optional().nullable(),
  pd_distance_right: z.string().optional().nullable(),
  pd_distance_left: z.string().optional().nullable(),
  pd_near_right: z.string().optional().nullable(),
  pd_near_left: z.string().optional().nullable(),
  pd_single: z.string().optional().nullable(),

  // Frame
  frame_supplier: z.string().optional().nullable(),
  frame_brand: z.string().optional().nullable(),
  frame_model: z.string().optional().nullable(),
  frame_colour: z.string().optional().nullable(),
  frame_size: z.string().optional().nullable(),
  frame_gensoft_sku: z.string().optional().nullable(),

  // Lens product
  lens_type: z.string().optional().nullable(),
  lens_material: z.string().optional().nullable(),
  lens_coating: z.string().optional().nullable(),
  lens_supplier: z.string().optional().nullable(),
  lens_gensoft_sku: z.string().optional().nullable(),

  // Services & Accessories
  services: z.array(z.object({
    name: z.string().min(1),
    price: z.number().min(0),
  })).default([]),
  accessories: z.array(z.object({
    name: z.string().min(1),
    sku: z.string().optional(),
    qty: z.number().min(1).default(1),
    price: z.number().min(0),
  })).default([]),

  // Pricing
  total_price: z.number().min(0, "Total price is required"),
  deposit_paid: z.number().min(0).default(0),

  // Lab
  lab_name: z.string().optional().nullable(),
  lab_order_ref: z.string().optional().nullable(),
  lab_sent_date: z.string().optional().nullable(),

  // Notes
  notes: z.string().optional().nullable(),
  internal_notes: z.string().optional().nullable(),

  customer_acknowledged: z.boolean().default(false),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

// Helper to convert string rx fields to numbers for DB insert
export function parseRxField(value: string | null | undefined): number | null {
  if (!value || value.trim() === "") return null;
  const n = parseFloat(value);
  return isNaN(n) ? null : n;
}

export function parseAxisField(value: string | null | undefined): number | null {
  if (!value || value.trim() === "") return null;
  const n = parseInt(value);
  return isNaN(n) ? null : n;
}

export function orderFormToDbValues(values: OrderFormValues) {
  return {
    ...values,
    lens_od_sph: parseRxField(values.lens_od_sph),
    lens_od_cyl: parseRxField(values.lens_od_cyl),
    lens_od_axis: parseAxisField(values.lens_od_axis),
    lens_od_add: parseRxField(values.lens_od_add),
    lens_os_sph: parseRxField(values.lens_os_sph),
    lens_os_cyl: parseRxField(values.lens_os_cyl),
    lens_os_axis: parseAxisField(values.lens_os_axis),
    lens_os_add: parseRxField(values.lens_os_add),
    pd_distance_right: parseRxField(values.pd_distance_right),
    pd_distance_left: parseRxField(values.pd_distance_left),
    pd_near_right: parseRxField(values.pd_near_right),
    pd_near_left: parseRxField(values.pd_near_left),
    pd_single: parseRxField(values.pd_single),
    collection_date: values.collection_date || null,
    prescription_id: values.prescription_id || null,
    lab_sent_date: values.lab_sent_date || null,
    notes: values.notes || null,
    internal_notes: values.internal_notes || null,
  };
}

// Keep the old name as alias for backward compat
export const orderSchema = orderFormSchema;
