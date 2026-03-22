export type OrderStatus =
  | "pending"
  | "in_progress"
  | "lab_sent"
  | "ready"
  | "collected"
  | "cancelled";

export type PrescriptionType =
  | "distance"
  | "near"
  | "bifocal"
  | "progressive"
  | "contact_lens";

export type ReminderType = "glasses_ready" | "exam_due" | "custom";
export type ReminderStatus = "scheduled" | "sent" | "failed" | "cancelled";
export type StaffRole = "admin" | "optometrist" | "dispenser" | "receptionist";

export interface StaffProfile {
  id: string;
  full_name: string;
  role: StaffRole;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  address_line1: string | null;
  address_line2: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  country: string;
  portal_user_id: string | null;
  gensoft_customer_id: string | null;
  medicare_number: string | null;
  dva_number: string | null;
  health_fund_name: string | null;
  health_fund_number: string | null;
  health_fund_ref: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Prescription {
  id: string;
  customer_id: string;
  prescription_type: PrescriptionType;
  exam_date: string;
  next_exam_date: string | null;
  prescribing_optom: string | null;
  od_sph: number | null;
  od_cyl: number | null;
  od_axis: number | null;
  od_add: number | null;
  od_va: string | null;
  os_sph: number | null;
  os_cyl: number | null;
  os_axis: number | null;
  os_add: number | null;
  os_va: string | null;
  pd_distance_right: number | null;
  pd_distance_left: number | null;
  pd_near_right: number | null;
  pd_near_left: number | null;
  pd_single: number | null;
  cl_od_brand: string | null;
  cl_od_base_curve: number | null;
  cl_od_diameter: number | null;
  cl_od_power: number | null;
  cl_od_cylinder: number | null;
  cl_od_axis: number | null;
  cl_os_brand: string | null;
  cl_os_base_curve: number | null;
  cl_os_diameter: number | null;
  cl_os_power: number | null;
  cl_os_cylinder: number | null;
  cl_os_axis: number | null;
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderAccessory {
  name: string;
  sku?: string;
  qty: number;
  price: number;
}

export interface OrderService {
  name: string;
  price: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  prescription_id: string | null;
  status: OrderStatus;
  order_date: string;
  collection_date: string | null;
  lens_od_sph: number | null;
  lens_od_cyl: number | null;
  lens_od_axis: number | null;
  lens_od_add: number | null;
  lens_os_sph: number | null;
  lens_os_cyl: number | null;
  lens_os_axis: number | null;
  lens_os_add: number | null;
  pd_distance_right: number | null;
  pd_distance_left: number | null;
  pd_near_right: number | null;
  pd_near_left: number | null;
  pd_single: number | null;
  frame_supplier: string | null;
  frame_brand: string | null;
  frame_model: string | null;
  frame_colour: string | null;
  frame_size: string | null;
  frame_gensoft_sku: string | null;
  lens_type: string | null;
  lens_material: string | null;
  lens_coating: string | null;
  lens_supplier: string | null;
  lens_gensoft_sku: string | null;
  services: OrderService[];
  accessories: OrderAccessory[];
  total_price: number;
  deposit_paid: number;
  lab_name: string | null;
  lab_order_ref: string | null;
  lab_sent_date: string | null;
  customer_acknowledged: boolean;
  acknowledged_at: string | null;
  notes: string | null;
  internal_notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  customer_id: string;
  order_id: string | null;
  reminder_type: ReminderType;
  status: ReminderStatus;
  scheduled_at: string;
  sent_at: string | null;
  recipient_email: string | null;
  recipient_phone: string | null;
  subject: string | null;
  body: string | null;
  error_message: string | null;
  created_by: string | null;
  created_at: string;
}

export interface GensoftProduct {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  supplier: string | null;
  cost_price: number | null;
  sell_price: number | null;
  stock_qty: number | null;
  is_active: boolean;
  raw_data: Record<string, unknown> | null;
  synced_at: string;
}

// Joined/extended types
export interface OrderWithCustomer extends Order {
  customers: Pick<Customer, "id" | "first_name" | "last_name" | "phone" | "mobile" | "email">;
}

export interface OrderWithDetails extends Order {
  customers: Customer;
  prescriptions: Prescription | null;
  staff_profiles: Pick<StaffProfile, "full_name"> | null;
}

export interface CustomerWithStats extends Customer {
  order_count?: number;
  last_order_date?: string | null;
}
