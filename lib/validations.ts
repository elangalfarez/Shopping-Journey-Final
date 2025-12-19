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
 * Checks if the date is December 20, 2025 (the event date)
 */
export function validateReceiptDate(dateString: string | null): boolean {
    if (!dateString) return false

    const lowerDate = dateString.toLowerCase()

    // Month name mappings to month numbers
    const monthMap: Record<string, number> = {
        'jan': 1, 'januari': 1, 'january': 1,
        'feb': 2, 'februari': 2, 'february': 2,
        'mar': 3, 'maret': 3, 'march': 3,
        'apr': 4, 'april': 4,
        'may': 5, 'mei': 5,
        'jun': 6, 'juni': 6, 'june': 6,
        'jul': 7, 'juli': 7, 'july': 7,
        'aug': 8, 'agustus': 8, 'august': 8,
        'sep': 9, 'september': 9,
        'oct': 10, 'oktober': 10, 'october': 10,
        'nov': 11, 'november': 11,
        'dec': 12, 'desember': 12, 'december': 12,
    }

    // Try text date format: "20 Dec 2025", "20 December 2025", "20 Desember 2025"
    const textDatePattern = /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s*['']?(\d{2,4})?/i
    const textMatch = lowerDate.match(textDatePattern)
    if (textMatch) {
        const day = parseInt(textMatch[1], 10)
        const monthName = textMatch[2].toLowerCase()
        const month = monthMap[monthName]
        const year = textMatch[3] ? parseInt(textMatch[3], 10) : 2025

        // Normalize 2-digit year
        const fullYear = year < 100 ? 2000 + year : year

        // Check for December 20, 2025
        if (day === 20 && month === 12 && fullYear === 2025) {
            return true
        }
        // Date doesn't match - return false
        return false
    }

    // Try DD/MM/YYYY or DD-MM-YYYY format
    const numericDMY = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/
    const dmyMatch = dateString.match(numericDMY)
    if (dmyMatch) {
        const day = parseInt(dmyMatch[1], 10)
        const month = parseInt(dmyMatch[2], 10)
        const year = parseInt(dmyMatch[3], 10)

        // Check for 20/12/2025
        if (day === 20 && month === 12 && year === 2025) {
            return true
        }
        return false
    }

    // Try YYYY-MM-DD format
    const numericYMD = /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/
    const ymdMatch = dateString.match(numericYMD)
    if (ymdMatch) {
        const year = parseInt(ymdMatch[1], 10)
        const month = parseInt(ymdMatch[2], 10)
        const day = parseInt(ymdMatch[3], 10)

        // Check for 2025-12-20
        if (day === 20 && month === 12 && year === 2025) {
            return true
        }
        return false
    }

    // Fallback: Check if "20", "Dec/December/Desember/12", and "2025/25" appear in the text
    const hasDay20 = /\b20\b/.test(dateString)
    const hasDecember = /\b(12|dec|desember|december)\b/i.test(dateString)
    const has2025 = /\b(2025|25)\b/.test(dateString)

    // All three components must be present for this fallback
    return hasDay20 && hasDecember && has2025
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