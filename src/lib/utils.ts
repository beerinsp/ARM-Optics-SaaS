import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function formatRxValue(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  lab_sent: "Lab Sent",
  ready: "Ready",
  collected: "Collected",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending:     "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  lab_sent:    "bg-purple-50 text-purple-700 border-purple-200",
  ready:       "bg-green-50 text-green-700 border-green-200",
  collected:   "bg-gray-100 text-gray-600 border-gray-200",
  cancelled:   "bg-red-50 text-red-700 border-red-200",
};

export const STAFF_ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  optometrist: "Optometrist",
  dispenser: "Dispenser",
  receptionist: "Receptionist",
};

export const PRESCRIPTION_TYPE_LABELS: Record<string, string> = {
  distance: "Distance",
  near: "Near / Reading",
  bifocal: "Bifocal",
  progressive: "Progressive",
  contact_lens: "Contact Lens",
};
