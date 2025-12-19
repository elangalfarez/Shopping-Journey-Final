// components/ui/button.tsx
// Created: Button component with Christmas theme variants

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-christmas-red to-red-600 text-white shadow-lg shadow-christmas-red/25 hover:from-red-500 hover:to-red-700 hover:shadow-xl hover:shadow-christmas-red/30",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border-2 border-christmas-red/50 bg-transparent text-christmas-red hover:bg-christmas-red/10 hover:border-christmas-red",
        secondary:
          "bg-gradient-to-r from-christmas-green to-green-600 text-white shadow-lg shadow-christmas-green/25 hover:from-green-500 hover:to-green-700 hover:shadow-xl hover:shadow-christmas-green/30",
        ghost:
          "text-text-light hover:bg-white/10 hover:text-white",
        link:
          "text-christmas-red underline-offset-4 hover:underline",
        gold:
          "bg-gradient-to-r from-christmas-gold to-amber-600 text-white shadow-lg shadow-christmas-gold/25 hover:from-amber-500 hover:to-amber-700 hover:shadow-xl hover:shadow-christmas-gold/30",
        christmas:
          "bg-gradient-to-r from-christmas-red via-christmas-gold to-christmas-green text-white shadow-lg hover:shadow-xl",
      },
      size: {
        default: "h-11 px-6 py-2 min-w-[44px]",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Memuat...
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }