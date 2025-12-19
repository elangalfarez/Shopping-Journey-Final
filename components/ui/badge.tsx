// components/ui/badge.tsx
// Created: Badge component with Christmas variants

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gray-700/50 text-gray-200",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-christmas-red/20 text-christmas-red border-christmas-red/30",
        success:
          "border-transparent bg-christmas-green/20 text-christmas-green border-christmas-green/30",
        warning:
          "border-transparent bg-christmas-gold/20 text-christmas-gold border-christmas-gold/30",
        outline:
          "text-foreground border-gray-600",
        christmas:
          "border-transparent bg-gradient-to-r from-christmas-red/20 to-christmas-green/20 text-white border-white/20",
        quota:
          "border-christmas-gold/30 bg-christmas-gold/10 text-christmas-gold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }