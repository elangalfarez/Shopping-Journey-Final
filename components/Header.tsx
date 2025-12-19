// components/Header.tsx
// Created: Main header component with navigation and quota display

"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Gift, TreePine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HeaderProps {
  title?: string
  subtitle?: string
  showBack?: boolean
  onBack?: () => void
  action?: React.ReactNode
  className?: string
  showLogo?: boolean
}

export default function Header({
  title,
  subtitle,
  showBack = false,
  onBack,
  action,
  className,
  showLogo = false,
}: HeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <header
      className={cn(
        "relative z-10 bg-gradient-to-r from-[#0f1419] via-[#1a1f2e] to-[#0f1419]",
        "border-b border-christmas-red/20 backdrop-blur-sm",
        "px-4 py-4 safe-area-top",
        className
      )}
    >
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {/* Left side - Back button or Logo */}
        <div className="w-20">
          {showBack ? (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-white hover:text-christmas-red transition-colors -ml-2"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span className="text-sm">Kembali</span>
            </Button>
          ) : showLogo ? (
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-christmas-red/20 rounded-lg">
                <TreePine className="w-5 h-5 text-christmas-red" />
              </div>
            </div>
          ) : (
            <div className="w-20" />
          )}
        </div>

        {/* Center - Title */}
        <div className="text-center flex-1">
          {title && (
            <h1 className="text-lg font-bold bg-gradient-to-r from-christmas-red via-christmas-gold to-christmas-green bg-clip-text text-transparent">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Right side - Action button or placeholder */}
        <div className="w-20 flex justify-end">
          {action || <div className="w-20" />}
        </div>
      </div>
    </header>
  )
}

// Quota display component for header
interface QuotaDisplayProps {
  remaining: number
  total: number
  className?: string
}

export function QuotaDisplay({ remaining, total, className }: QuotaDisplayProps) {
  const percentage = (remaining / total) * 100

  // Determine urgency level
  const getUrgencyClass = () => {
    if (remaining === 0) return "bg-gray-800/50 text-gray-400 border-gray-700/30"
    if (percentage <= 10) return "bg-christmas-red/20 text-christmas-red border-christmas-red/30 animate-pulse"
    if (percentage <= 30) return "bg-christmas-gold/20 text-christmas-gold border-christmas-gold/30"
    return "bg-christmas-green/20 text-christmas-green border-christmas-green/30"
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all",
        getUrgencyClass(),
        className
      )}
    >
      <Gift className="w-3.5 h-3.5" />
      <span>{remaining}/{total}</span>
    </div>
  )
}