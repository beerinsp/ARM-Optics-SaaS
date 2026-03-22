"use client";
import { LogOut } from "lucide-react";

export function PortalSignOut({ label }: { label: string }) {
  return (
    <form action="/api/auth/signout" method="POST">
      <button className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-700 transition-colors">
        <LogOut className="w-3.5 h-3.5" /> {label}
      </button>
    </form>
  );
}
