import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight transition-colors",
  {
    variants: {
      variant: {
        default:   "border-brand-200 bg-brand-100 text-brand-800",
        secondary: "border-brand-100 bg-brand-50 text-brand-500",
        success:   "border-green-200 bg-green-50 text-green-700",
        warning:   "border-amber-200 bg-amber-50 text-amber-700",
        danger:    "border-red-200 bg-red-50 text-red-700",
        info:      "border-blue-200 bg-blue-50 text-blue-700",
        purple:    "border-purple-200 bg-purple-50 text-purple-700",
        accent:    "border-accent/30 bg-accent/10 text-accent-dark",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
