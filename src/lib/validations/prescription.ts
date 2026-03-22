import { z } from "zod";

const rxNum = z.string().optional().nullable().transform(v => v === "" ? null : v ? parseFloat(v) : null);
const rxInt = z.string().optional().nullable().transform(v => v === "" ? null : v ? parseInt(v) : null);
// Empty strings from unset date/text inputs must become null, not "" — Postgres rejects "" for DATE/TEXT NOT NULL columns.
const optText = z.string().optional().nullable().transform(v => v === "" ? null : v ?? null);

export const prescriptionSchema = z.object({
  customer_id: z.string().uuid(),
  prescription_type: z.enum(["distance", "near", "bifocal", "progressive", "contact_lens"]).default("distance"),
  exam_date: z.string().min(1, "Exam date is required"),
  next_exam_date: optText,
  prescribing_optom: optText,

  od_sph: rxNum,
  od_cyl: rxNum,
  od_axis: rxInt,
  od_add: rxNum,
  od_va: optText,
  os_sph: rxNum,
  os_cyl: rxNum,
  os_axis: rxInt,
  os_add: rxNum,
  os_va: optText,

  pd_distance_right: rxNum,
  pd_distance_left: rxNum,
  pd_near_right: rxNum,
  pd_near_left: rxNum,
  pd_single: rxNum,

  // Contact lens
  cl_od_brand: optText,
  cl_od_base_curve: rxNum,
  cl_od_diameter: rxNum,
  cl_od_power: rxNum,
  cl_od_cylinder: rxNum,
  cl_od_axis: rxInt,
  cl_os_brand: optText,
  cl_os_base_curve: rxNum,
  cl_os_diameter: rxNum,
  cl_os_power: rxNum,
  cl_os_cylinder: rxNum,
  cl_os_axis: rxInt,

  notes: optText,
});

export type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;
