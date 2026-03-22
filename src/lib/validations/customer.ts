import { z } from "zod";

export const customerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  address_line1: z.string().optional().nullable(),
  address_line2: z.string().optional().nullable(),
  suburb: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postcode: z.string().optional().nullable(),
  country: z.string().default("Australia"),
  medicare_number: z.string().optional().nullable(),
  dva_number: z.string().optional().nullable(),
  health_fund_name: z.string().optional().nullable(),
  health_fund_number: z.string().optional().nullable(),
  health_fund_ref: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
