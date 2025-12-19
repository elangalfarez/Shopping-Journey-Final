// components/ui/card.tsx
// Created: Card component with glassmorphism Christmas variants

import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "glass" | "christmas" | "success" | "gold"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-card text-card-foreground border border-border",
    glass: "backdrop-blur-xl bg-gradient-to-br from-gray-900/80 via-gray-950/60 to-gray-900/80 border-2 border-white/10 shadow-2xl",
    christmas: "backdrop-blur-xl bg-gradient-to-br from-gray-900/80 via-red-950/20 to-gray-900/80 border-2 border-christmas-red/30 shadow-2xl shadow-christmas-red/10",
    success: "backdrop-blur-xl bg-gradient-to-br from-gray-900/80 via-green-950/20 to-gray-900/80 border-2 border-christmas-green/30 shadow-2xl shadow-christmas-green/10",
    gold: "backdrop-blur-xl bg-gradient-to-br from-gray-900/80 via-amber-950/20 to-gray-900/80 border-2 border-christmas-gold/30 shadow-2xl shadow-christmas-gold/10",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl transition-all duration-300",
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-bold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }