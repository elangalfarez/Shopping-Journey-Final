// components/ui/segmented-progress.tsx
// Created: Segmented progress bar for mission tracking

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface SegmentedProgressBarProps {
    current: number
    total: number
    className?: string
    showLabels?: boolean
    labels?: string[]
}

export function SegmentedProgressBar({
    current,
    total,
    className,
    showLabels = false,
    labels = [],
}: SegmentedProgressBarProps) {
    return (
        <div className={cn("w-full", className)}>
            {/* Progress segments */}
            <div className="flex items-center gap-1">
                {Array.from({ length: total }, (_, index) => {
                    const isCompleted = index < current
                    const isCurrent = index === current
                    const isLast = index === total - 1

                    return (
                        <React.Fragment key={index}>
                            {/* Segment */}
                            <div className="flex-1 relative">
                                <div
                                    className={cn(
                                        "h-2 rounded-full transition-all duration-500",
                                        isCompleted
                                            ? "bg-gradient-to-r from-christmas-green to-green-500"
                                            : isCurrent
                                                ? "bg-gradient-to-r from-christmas-red/50 to-christmas-red/30 animate-pulse"
                                                : "bg-gray-700/50"
                                    )}
                                />
                                {isCompleted && (
                                    <div className="absolute -top-0.5 right-0 w-3 h-3 bg-christmas-green rounded-full flex items-center justify-center transform translate-x-1/2">
                                        <Check className="w-2 h-2 text-white stroke-[3]" />
                                    </div>
                                )}
                            </div>
                        </React.Fragment>
                    )
                })}
            </div>

            {/* Labels */}
            {showLabels && labels.length > 0 && (
                <div className="flex justify-between mt-2">
                    {labels.map((label, index) => (
                        <span
                            key={index}
                            className={cn(
                                "text-xs transition-colors",
                                index < current
                                    ? "text-christmas-green"
                                    : index === current
                                        ? "text-christmas-red"
                                        : "text-gray-500"
                            )}
                        >
                            {label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}

interface StepProgressProps {
    currentStep: number
    totalSteps: number
    labels?: string[]
    icons?: React.ReactNode[]
    className?: string
}

export function StepProgress({
    currentStep,
    totalSteps,
    labels = [],
    icons = [],
    className,
}: StepProgressProps) {
    return (
        <div className={cn("flex items-center justify-center", className)}>
            {Array.from({ length: totalSteps }, (_, index) => {
                const stepNumber = index + 1
                const isCompleted = stepNumber < currentStep
                const isCurrent = stepNumber === currentStep
                const isLast = stepNumber === totalSteps

                return (
                    <React.Fragment key={index}>
                        {/* Step circle */}
                        <div
                            className={cn(
                                "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500",
                                isCompleted
                                    ? "bg-gradient-to-br from-christmas-green to-green-600 shadow-lg shadow-christmas-green/50"
                                    : isCurrent
                                        ? "bg-gradient-to-br from-christmas-red to-red-600 shadow-lg shadow-christmas-red/50 scale-110"
                                        : "bg-gray-700/50 backdrop-blur-sm"
                            )}
                        >
                            {isCompleted ? (
                                <Check className="w-5 h-5 text-white" />
                            ) : icons[index] ? (
                                <span
                                    className={cn(
                                        "w-5 h-5",
                                        isCurrent ? "text-white" : "text-gray-400"
                                    )}
                                >
                                    {icons[index]}
                                </span>
                            ) : (
                                <span
                                    className={cn(
                                        "text-sm font-bold",
                                        isCurrent ? "text-white" : "text-gray-400"
                                    )}
                                >
                                    {stepNumber}
                                </span>
                            )}
                        </div>

                        {/* Connector line */}
                        {!isLast && (
                            <div
                                className={cn(
                                    "h-1 w-12 rounded-full transition-all duration-500",
                                    isCompleted
                                        ? "bg-gradient-to-r from-christmas-green to-green-500"
                                        : "bg-gray-700/50"
                                )}
                            />
                        )}
                    </React.Fragment>
                )
            })}
        </div>
    )
}

export { SegmentedProgressBar as default }