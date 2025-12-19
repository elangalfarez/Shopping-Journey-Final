// components/ui/spinner.tsx
// Created: Loading spinner component

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface SpinnerProps {
    size?: "sm" | "md" | "lg" | "xl"
    className?: string
    color?: "default" | "red" | "green" | "gold" | "white"
}

export function Spinner({ size = "md", className, color = "default" }: SpinnerProps) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
        xl: "w-12 h-12",
    }

    const colorClasses = {
        default: "text-gray-400",
        red: "text-christmas-red",
        green: "text-christmas-green",
        gold: "text-christmas-gold",
        white: "text-white",
    }

    return (
        <Loader2
            className={cn(
                "animate-spin",
                sizeClasses[size],
                colorClasses[color],
                className
            )}
        />
    )
}

interface LoadingOverlayProps {
    message?: string
    className?: string
}

export function LoadingOverlay({ message, className }: LoadingOverlayProps) {
    return (
        <div
            className={cn(
                "absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-50",
                className
            )}
        >
            <div className="relative">
                {/* Outer ring */}
                <div className="w-16 h-16 border-4 border-christmas-red/30 border-t-christmas-red rounded-full animate-spin" />
            </div>
            {message && (
                <p className="text-white text-sm mt-4">{message}</p>
            )}
        </div>
    )
}

interface LoadingDotsProps {
    className?: string
}

export function LoadingDots({ className }: LoadingDotsProps) {
    return (
        <span className={cn("inline-flex items-center gap-1", className)}>
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                />
            ))}
        </span>
    )
}

export default Spinner