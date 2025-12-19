// hooks/useReducedMotion.ts
// Created: Hook for respecting prefers-reduced-motion

"use client"

import { useState, useEffect } from "react"

/**
 * Hook to detect if user prefers reduced motion
 * Returns true if reduced motion is preferred
 */
export function useReducedMotion(): boolean {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

    useEffect(() => {
        // Check initial preference
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
        setPrefersReducedMotion(mediaQuery.matches)

        // Listen for changes
        const handleChange = (event: MediaQueryListEvent) => {
            setPrefersReducedMotion(event.matches)
        }

        mediaQuery.addEventListener("change", handleChange)

        return () => {
            mediaQuery.removeEventListener("change", handleChange)
        }
    }, [])

    return prefersReducedMotion
}

/**
 * Get motion-safe animation variants
 * Returns reduced animations if user prefers reduced motion
 */
export function useMotionSafe() {
    const prefersReducedMotion = useReducedMotion()

    // Standard animation variants
    const fadeInUp = prefersReducedMotion
        ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
        : {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
        }

    const scaleIn = prefersReducedMotion
        ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
        : {
            initial: { opacity: 0, scale: 0.9 },
            animate: { opacity: 1, scale: 1 },
        }

    const slideIn = prefersReducedMotion
        ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
        : {
            initial: { opacity: 0, x: 20 },
            animate: { opacity: 1, x: 0 },
        }

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: prefersReducedMotion ? 0 : 0.1,
            },
        },
    }

    // Transition settings
    const transition = prefersReducedMotion
        ? { duration: 0.01 }
        : { duration: 0.3, ease: "easeOut" }

    const springTransition = prefersReducedMotion
        ? { duration: 0.01 }
        : { type: "spring", stiffness: 300, damping: 30 }

    return {
        prefersReducedMotion,
        fadeInUp,
        scaleIn,
        slideIn,
        staggerContainer,
        transition,
        springTransition,
    }
}

export default useReducedMotion