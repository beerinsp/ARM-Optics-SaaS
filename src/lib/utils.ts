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
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  in_progress: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  lab_sent: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  ready: "bg-green-500/20 text-green-300 border-green-500/30",
  collected: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
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
