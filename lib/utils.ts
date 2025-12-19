// lib/utils.ts
// Created: Utility functions for Shopping Journey

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS classes with clsx
 * Handles conditional classes and removes duplicates
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency to Indonesian Rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format phone number to display format
 * +6281234567890 → 0812-3456-7890
 */
export function formatPhoneDisplay(phone: string): string {
  // Remove +62 prefix and format
  const cleaned = phone.replace(/^\+62/, '0').replace(/\D/g, '')

  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`
  } else if (cleaned.length === 12) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`
  } else if (cleaned.length === 13) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`
  }

  return cleaned
}

/**
 * Normalize phone number to +62 format
 * 081234567890 → +6281234567890
 * 628123456789 → +628123456789
 */
export function normalizePhone(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '')

  // Handle different formats
  if (cleaned.startsWith('62')) {
    return `+${cleaned}`
  } else if (cleaned.startsWith('0')) {
    return `+62${cleaned.slice(1)}`
  } else if (cleaned.startsWith('8')) {
    return `+62${cleaned}`
  }

  return `+62${cleaned}`
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Format time to Indonesian locale (24h)
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * Format datetime to Indonesian locale
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * Validate Indonesian phone number format
 */
export function isValidIndonesianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')

  // Must be 10-13 digits and start with valid prefix
  if (cleaned.length < 10 || cleaned.length > 13) {
    return false
  }

  // Valid prefixes: 08, 628, +628
  const validPrefixes = ['08', '628', '8']
  const normalizedStart = cleaned.startsWith('62')
    ? cleaned.slice(2)
    : cleaned.startsWith('0')
      ? cleaned.slice(1)
      : cleaned

  // Must start with 8 after removing country code
  return normalizedStart.startsWith('8')
}

/**
 * Validate Indonesian name (letters and spaces only, 2-50 chars)
 */
export function isValidIndonesianName(name: string): boolean {
  const trimmed = name.trim()

  if (trimmed.length < 2 || trimmed.length > 50) {
    return false
  }

  // Allow letters (including Indonesian), spaces, apostrophes, periods
  const validPattern = /^[a-zA-Z\u00C0-\u017F\s'.]+$/
  return validPattern.test(trimmed)
}

/**
 * Generate a random redemption code
 * Format: SMK-XXXX-XXXXXXXX
 */
export function generateRedemptionCode(phoneNumber: string): string {
  const phoneDigits = phoneNumber.replace(/\D/g, '').slice(-4)
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `SMK-${phoneDigits}-${timestamp}${random}`
}

/**
 * Parse time string to minutes since midnight
 * "19:30" → 1170
 */
export function parseTimeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Check if a time is after minimum time
 * Both in HH:MM format
 */
export function isTimeAfter(time: string, minTime: string): boolean {
  return parseTimeToMinutes(time) >= parseTimeToMinutes(minTime)
}

/**
 * Delay utility for animations
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Check if running in browser
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Safely access localStorage
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (!isBrowser()) return defaultValue

  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * Safely set localStorage
 */
export function setLocalStorage<T>(key: string, value: T): void {
  if (!isBrowser()) return

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

/**
 * Remove from localStorage
 */
export function removeLocalStorage(key: string): void {
  if (!isBrowser()) return

  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Failed to remove from localStorage:', error)
  }
}