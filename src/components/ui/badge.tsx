import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-gold/30 bg-gold/15 text-gold",
        secondary: "border-white/10 bg-white/5 text-dark-300",
        success: "border-green-500/30 bg-green-500/15 text-green-400",
        warning: "border-yellow-500/30 bg-yellow-500/15 text-yellow-300",
        danger: "border-red-500/30 bg-red-500/15 text-red-400",
        info: "border-blue-500/30 bg-blue-500/15 text-blue-300",
        purple: "border-purple-500/30 bg-purple-500/15 text-purple-300",
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
