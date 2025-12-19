// components/ui/input.tsx
// Created: Input component with Christmas theme styling

import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border-2 bg-gray-900/50 px-4 py-3 text-base text-white ring-offset-background transition-all duration-200",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-gray-500",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "hover:border-gray-600/70",
          error
            ? "border-christmas-red/50 focus-visible:border-christmas-red focus-visible:ring-christmas-red/30"
            : "border-gray-700/50 focus-visible:border-christmas-red/50 focus-visible:ring-christmas-red/20",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }