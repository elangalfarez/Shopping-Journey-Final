// lib/pwa.ts
// Created: PWA utilities and service worker registration

/**
 * Check if the app is running as a PWA
 */
export function isPWA(): boolean {
    if (typeof window === "undefined") return false

    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://")
    )
}

/**
 * Check if the device supports PWA installation
 */
export function canInstallPWA(): boolean {
    if (typeof window === "undefined") return false

    // Check for beforeinstallprompt support
    return "BeforeInstallPromptEvent" in window || "onbeforeinstallprompt" in window
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === "undefined" || !("Notification" in window)) {
        return "denied"
    }

    return await Notification.requestPermission()
}

/**
 * Check if device prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
    if (typeof window === "undefined") return false

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Share content using Web Share API
 */
export async function shareContent(data: {
    title?: string
    text?: string
    url?: string
}): Promise<boolean> {
    if (typeof navigator === "undefined" || !navigator.share) {
        return false
    }

    try {
        await navigator.share(data)
        return true
    } catch (error) {
        // User cancelled or error occurred
        return false
    }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
        // Fallback for older browsers
        try {
            const textArea = document.createElement("textarea")
            textArea.value = text
            textArea.style.position = "fixed"
            textArea.style.left = "-999999px"
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand("copy")
            document.body.removeChild(textArea)
            return true
        } catch {
            return false
        }
    }

    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        return false
    }
}

/**
 * Vibrate device (if supported)
 */
export function vibrate(pattern: number | number[] = 50): boolean {
    if (typeof navigator === "undefined" || !navigator.vibrate) {
        return false
    }

    return navigator.vibrate(pattern)
}

export default {
    isPWA,
    canInstallPWA,
    requestNotificationPermission,
    prefersReducedMotion,
    shareContent,
    copyToClipboard,
    vibrate,
}