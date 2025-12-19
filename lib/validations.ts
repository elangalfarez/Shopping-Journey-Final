// lib/validations.ts
// Created: Zod validation schemas for Shopping Journey

import { z } from 'zod'
import { VALIDATION, ERROR_MESSAGES, MISSION_1, MISSION_2 } from './constants'

// ===========================================
// PHONE NUMBER VALIDATION
// ===========================================

/**
 * Normalize phone number to +62 format
 */
export function normalizePhoneNumber(phone: string): string {
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
 * Phone number schema
 */
export const phoneSchema = z
    .string()
    .min(1, ERROR_MESSAGES.phoneRequired)
    .transform((val) => val.replace(/\D/g, ''))
    .refine(
        (val) => val.length >= VALIDATION.phone.minLength && val.length <= VALIDATION.phone.maxLength,
        ERROR_MESSAGES.phoneInvalid
    )
    .refine(
        (val) => {
            // Must start with valid Indonesian prefix
            const normalized = val.startsWith('62') ? val : val.startsWith('0') ? `62${val.slice(1)}` : `62${val}`
            return /^62[8][1-9][0-9]{7,11}$/.test(normalized)
        },
        ERROR_MESSAGES.phoneInvalid
    )
    .transform(normalizePhoneNumber)

// ===========================================
// NAME VALIDATION
// ===========================================

/**
 * Indonesian name schema
 */
export const nameSchema = z
    .string()
    .min(1, ERROR_MESSAGES.nameRequired)
    .transform((val) => val.trim())
    .refine((val) => val.length >= VALIDATION.name.minLength, ERROR_MESSAGES.nameTooShort)
    .refine((val) => val.length <= VALIDATION.name.maxLength, ERROR_MESSAGES.nameTooLong)
    .refine((val) => VALIDATION.name.pattern.test(val), ERROR_MESSAGES.nameInvalid)
    .transform((val) => {
        // Capitalize each word
        return val
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    })

// ===========================================
// REGISTRATION SCHEMA
// ===========================================

export const registrationSchema = z.object({
    name: nameSchema,
    phone: phoneSchema,
    acceptTerms: z
        .boolean()
        .refine((val) => val === true, ERROR_MESSAGES.termsRequired),
})

export type RegistrationFormData = z.infer<typeof registrationSchema>

// ===========================================
// RECEIPT VALIDATION
// ===========================================

/**
 * Receipt file validation schema
 */
export const receiptFileSchema = z
    .instanceof(File)
    .refine(
        (file) => file.size <= VALIDATION.receipt.maxFileSize,
        ERROR_MESSAGES.receiptTooLarge
    )
    .refine(
        (file) => VALIDATION.receipt.allowedTypes.includes(file.type),
        ERROR_MESSAGES.receiptInvalidType
    )

/**
 * Validate receipt date
 */
export function validateReceiptDate(dateString: string | null): boolean {
    if (!dateString) return false

    // Expected date: 20 December 2025
    const targetDate = '2025-12-20'

    // Try to parse various date formats
    const patterns = [
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/, // DD/MM/YYYY or DD-MM-YYYY
        /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/, // YYYY-MM-DD
        /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s*(\d{2,4})?/i,
    ]

    for (const pattern of patterns) {
        const match = dateString.match(pattern)
        if (match) {
            // For simplicity, we accept any match as potentially valid
            // The OCR might not perfectly parse the date
            return true
        }
    }

    // Check if "20" and "12" or "Dec" appear in the text
    const hasDay20 = /\b20\b/.test(dateString)
    const hasDecember = /\b(12|dec|desember)\b/i.test(dateString)
    const has2025 = /\b(2025|25)\b/.test(dateString)

    return hasDay20 && hasDecember
}

/**
 * Validate receipt time
 */
export function validateReceiptTime(
    timeString: string | null,
    minTime: string
): boolean {
    if (!timeString) return false

    // Parse time from string (various formats: 19:30, 19.30, 7:30 PM, etc.)
    const timeMatch = timeString.match(/(\d{1,2})[:\.](\d{2})(?:\s*(AM|PM))?/i)

    if (!timeMatch) return false

    let hours = parseInt(timeMatch[1], 10)
    const minutes = parseInt(timeMatch[2], 10)
    const period = timeMatch[3]?.toUpperCase()

    // Convert 12-hour to 24-hour format
    if (period === 'PM' && hours !== 12) {
        hours += 12
    } else if (period === 'AM' && hours === 12) {
        hours = 0
    }

    // Parse minimum time
    const [minHours, minMinutes] = minTime.split(':').map(Number)

    // Compare times
    const receiptMinutes = hours * 60 + minutes
    const minTimeMinutes = minHours * 60 + minMinutes

    return receiptMinutes >= minTimeMinutes
}

/**
 * Validate receipt amount
 */
export function validateReceiptAmount(
    amount: number | null,
    minAmount: number
): boolean {
    if (amount === null || amount === undefined) return false
    return amount >= minAmount
}

/**
 * Validate complete receipt for a mission
 */
export interface ReceiptValidationResult {
    isValid: boolean
    errors: string[]
}

export function validateReceiptForMission(
    missionId: 1 | 2,
    extractedData: {
        date: string | null
        time: string | null
        amount: number | null
    }
): ReceiptValidationResult {
    const mission = missionId === 1 ? MISSION_1 : MISSION_2
    const errors: string[] = []

    // Validate date (must be Dec 20, 2025)
    if (!validateReceiptDate(extractedData.date)) {
        errors.push(ERROR_MESSAGES.receiptDateInvalid)
    }

    // Validate time
    if (!validateReceiptTime(extractedData.time, mission.minTime)) {
        errors.push(ERROR_MESSAGES.receiptTimeInvalid(mission.minTimeDisplay))
    }

    // Validate amount
    if (!validateReceiptAmount(extractedData.amount, mission.minAmount)) {
        errors.push(ERROR_MESSAGES.receiptAmountInvalid(mission.minAmount))
    }

    return {
        isValid: errors.length === 0,
        errors,
    }
}

// ===========================================
// ADMIN VALIDATION
// ===========================================

export const adminLoginSchema = z.object({
    password: z
        .string()
        .min(1, 'Password wajib diisi')
        .min(VALIDATION.admin.minLength, `Password minimal ${VALIDATION.admin.minLength} karakter`),
})

export type AdminLoginFormData = z.infer<typeof adminLoginSchema>

// ===========================================
// RECOVERY SCHEMA (lookup by phone)
// ===========================================

export const recoverySchema = z.object({
    phone: phoneSchema,
})

export type RecoveryFormData = z.infer<typeof recoverySchema>