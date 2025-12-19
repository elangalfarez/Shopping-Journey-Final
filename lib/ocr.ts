// lib/ocr.ts
// Created: OCR service using Tesseract.js for receipt text extraction

import Tesseract from 'tesseract.js'
import type { ReceiptOCRData } from './types'

// ===========================================
// OCR CONFIGURATION
// ===========================================

const OCR_CONFIG = {
    lang: 'ind+eng', // Indonesian + English
    workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
    corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core.wasm.js',
}

// ===========================================
// TEXT EXTRACTION PATTERNS
// ===========================================

const PATTERNS = {
    // Date patterns - ordered by priority (text dates first, then numeric)
    dateWithMonth: [
        // Text month formats (highest priority) - "24 Oct 2025", "24 Oktober 2025"
        /(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s*['']?(\d{2,4})/gi,
    ],
    dateNumeric: [
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g, // DD/MM/YYYY, DD-MM-YYYY (4-digit year only)
        /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g, // YYYY-MM-DD
    ],

    // Time patterns (various formats)
    time: [
        /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/gi, // HH:MM, HH:MM:SS with colon
        /(?:jam|time|waktu)[:\s]*(\d{1,2})[:\.](\d{2})/gi, // Prefixed with "jam", "time", etc.
    ],

    // Amount patterns - for ACTUAL PAYMENT (not savings/discounts)
    // Ordered by specificity - most specific patterns first
    paymentAmount: [
        // Specific payment keywords (highest priority)
        /(?:total\s*payment|total\s*bayar|total\s*dibayar|pembayaran)[:\s]*(?:rp\.?|idr)?[\s]*([0-9.,]+)/gi,
        /(?:tunai|cash|kartu|card|debit|kredit|credit|gopay|ovo|dana|shopeepay|qris)[^0-9]*(?:rp\.?|idr)?[\s]*([0-9.,]+)/gi,
        // Total sales (common on Indonesian receipts)
        /(?:total\s*sales|total\s*penjualan)[:\s]*(?:rp\.?|idr)?[\s]*([0-9.,]+)/gi,
    ],
    // Fallback amount patterns (lower priority)
    generalAmount: [
        /(?:grand\s*total|total\s*belanja|total\s*harga)[:\s]*(?:rp\.?|idr)?[\s]*([0-9.,]+)/gi,
        /(?:^|\n)\s*total[:\s]*(?:rp\.?|idr)?[\s]*([0-9.,]+)/gim, // "Total" at line start
    ],
    // Patterns to EXCLUDE (savings, discounts)
    excludeAmount: [
        /(?:saving|hemat|diskon|discount|potongan|off)[:\s]*-?(?:rp\.?|idr)?[\s]*([0-9.,]+)/gi,
        /(?:total\s*saving|total\s*hemat|total\s*diskon)[:\s]*-?(?:rp\.?|idr)?[\s]*([0-9.,]+)/gi,
    ],
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Extract date from OCR text
 * Prioritizes text dates (e.g., "24 Oct 2025") over numeric dates
 * Avoids receipt numbers that look like dates
 */
function extractDate(text: string): string | null {
    // First, try to find dates with month names (most reliable)
    for (const pattern of PATTERNS.dateWithMonth) {
        const matches = text.matchAll(pattern)
        for (const match of matches) {
            return match[0]
        }
    }

    // Fallback to numeric dates, but be more careful
    for (const pattern of PATTERNS.dateNumeric) {
        const matches = text.matchAll(pattern)
        for (const match of matches) {
            const fullMatch = match[0]
            // Skip if this looks like a receipt number (surrounded by more digits)
            const matchIndex = match.index || 0
            const before = text.slice(Math.max(0, matchIndex - 5), matchIndex)
            const after = text.slice(matchIndex + fullMatch.length, matchIndex + fullMatch.length + 5)

            // If there are digits immediately before/after, likely a receipt number
            if (/\d$/.test(before) || /^\d/.test(after)) {
                continue
            }

            // Validate the date components
            const parts = fullMatch.split(/[\/\-]/).map(Number)
            if (parts.length === 3) {
                const [a, b, c] = parts
                // Check if it's a valid date (basic validation)
                if (a >= 1 && a <= 31 && b >= 1 && b <= 12) {
                    return fullMatch
                }
                if (a >= 2020 && a <= 2030 && b >= 1 && b <= 12 && c >= 1 && c <= 31) {
                    return fullMatch
                }
            }
        }
    }
    return null
}

/**
 * Extract time from OCR text
 */
function extractTime(text: string): string | null {
    for (const pattern of PATTERNS.time) {
        const matches = text.matchAll(pattern)
        for (const match of matches) {
            // Check if this looks like a valid time
            const hours = parseInt(match[1], 10)
            if (hours >= 0 && hours <= 23) {
                return match[0]
            }
        }
    }
    return null
}

/**
 * Parse amount string to number
 */
function parseAmount(amountStr: string): number {
    // Remove currency symbols and spaces
    let cleaned = amountStr.replace(/[rp\sidr]/gi, '').trim()

    // Handle Indonesian format (150.000) vs international (150,000)
    // Count dots and commas to determine format
    const dots = (cleaned.match(/\./g) || []).length
    const commas = (cleaned.match(/,/g) || []).length

    if (dots > 0 && commas === 0) {
        // Indonesian format: 150.000 means 150000
        cleaned = cleaned.replace(/\./g, '')
    } else if (commas > 0 && dots === 0) {
        // International format: 150,000 means 150000
        cleaned = cleaned.replace(/,/g, '')
    } else if (dots > 0 && commas > 0) {
        // Mixed format - assume last separator is decimal
        const lastDot = cleaned.lastIndexOf('.')
        const lastComma = cleaned.lastIndexOf(',')

        if (lastDot > lastComma) {
            // 1,000.50 format
            cleaned = cleaned.replace(/,/g, '').replace('.', '.')
        } else {
            // 1.000,50 format (European/Indonesian)
            cleaned = cleaned.replace(/\./g, '').replace(',', '.')
        }
    }

    const amount = parseFloat(cleaned)
    return isNaN(amount) ? 0 : Math.round(amount)
}

/**
 * Extract amounts that should be EXCLUDED (savings, discounts)
 */
function extractExcludedAmounts(text: string): Set<number> {
    const excluded = new Set<number>()

    for (const pattern of PATTERNS.excludeAmount) {
        const matches = text.matchAll(pattern)
        for (const match of matches) {
            const amountStr = match[1] || match[0]
            const amount = parseAmount(amountStr)
            if (amount >= 1000) {
                excluded.add(amount)
            }
        }
    }

    return excluded
}

/**
 * Extract amount from OCR text
 * Prioritizes actual payment amounts over savings/discounts
 */
function extractAmount(text: string): number | null {
    // First, identify amounts to exclude (savings, discounts)
    const excludedAmounts = extractExcludedAmounts(text)

    // Try payment-specific patterns first (highest priority)
    for (const pattern of PATTERNS.paymentAmount) {
        const matches = text.matchAll(pattern)
        for (const match of matches) {
            const amountStr = match[1] || match[0]
            const amount = parseAmount(amountStr)

            // Filter reasonable receipt amounts and ensure it's not an excluded amount
            if (amount >= 1000 && amount <= 50000000 && !excludedAmounts.has(amount)) {
                return amount
            }
        }
    }

    // Try general total patterns (fallback)
    const generalAmounts: number[] = []
    for (const pattern of PATTERNS.generalAmount) {
        const matches = text.matchAll(pattern)
        for (const match of matches) {
            const amountStr = match[1] || match[0]
            const amount = parseAmount(amountStr)

            // Filter reasonable amounts and exclude savings
            if (amount >= 1000 && amount <= 50000000 && !excludedAmounts.has(amount)) {
                generalAmounts.push(amount)
            }
        }
    }

    if (generalAmounts.length > 0) {
        // For general amounts, prefer smaller totals (more likely to be actual payment)
        // Large amounts are often pre-discount totals
        generalAmounts.sort((a, b) => a - b)

        // If there are multiple amounts, the smaller ones are more likely actual payment
        // But filter out very small amounts that might be item prices
        const reasonableAmounts = generalAmounts.filter(a => a >= 100000)
        if (reasonableAmounts.length > 0) {
            return reasonableAmounts[0] // Return smallest reasonable amount
        }
        return generalAmounts[0]
    }

    return null
}

/**
 * Calculate confidence score based on extracted data
 */
function calculateConfidence(data: Omit<ReceiptOCRData, 'confidence'>): number {
    let score = 0

    // Date found: +30%
    if (data.date) score += 0.3

    // Time found: +30%
    if (data.time) score += 0.3

    // Amount found: +40%
    if (data.amount && data.amount > 0) score += 0.4

    return Math.round(score * 100)
}

// ===========================================
// MAIN OCR FUNCTION
// ===========================================

/**
 * Extract data from receipt image using Tesseract.js
 */
export async function extractReceiptData(
    imageSource: File | Blob | string
): Promise<ReceiptOCRData> {
    try {
        // Perform OCR
        const result = await Tesseract.recognize(imageSource, OCR_CONFIG.lang, {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
                }
            },
        })

        const rawText = result.data.text

        // Extract structured data
        const date = extractDate(rawText)
        const time = extractTime(rawText)
        const amount = extractAmount(rawText)

        const data: Omit<ReceiptOCRData, 'confidence'> = {
            date,
            time,
            amount,
            rawText,
        }

        return {
            ...data,
            confidence: calculateConfidence(data),
        }
    } catch (error) {
        console.error('OCR error:', error)
        return {
            date: null,
            time: null,
            amount: null,
            rawText: '',
            confidence: 0,
        }
    }
}

/**
 * Pre-process image for better OCR results
 * Returns a canvas element or data URL
 */
export async function preprocessImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const img = new Image()

            img.onload = () => {
                // Create canvas
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')

                if (!ctx) {
                    resolve(e.target?.result as string)
                    return
                }

                // Set canvas size (max 2000px for performance)
                const maxSize = 2000
                let width = img.width
                let height = img.height

                if (width > maxSize || height > maxSize) {
                    const ratio = Math.min(maxSize / width, maxSize / height)
                    width = Math.round(width * ratio)
                    height = Math.round(height * ratio)
                }

                canvas.width = width
                canvas.height = height

                // Draw image
                ctx.drawImage(img, 0, 0, width, height)

                // Apply slight contrast enhancement
                const imageData = ctx.getImageData(0, 0, width, height)
                const data = imageData.data

                // Simple contrast adjustment
                const factor = 1.2
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128))
                    data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128))
                    data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128))
                }

                ctx.putImageData(imageData, 0, 0)

                // Return as data URL
                resolve(canvas.toDataURL('image/jpeg', 0.9))
            }

            img.onerror = () => {
                resolve(e.target?.result as string)
            }

            img.src = e.target?.result as string
        }

        reader.onerror = () => {
            reject(new Error('Failed to read image file'))
        }

        reader.readAsDataURL(file)
    })
}

/**
 * Full receipt processing pipeline
 */
export async function processReceipt(file: File): Promise<ReceiptOCRData> {
    try {
        // Preprocess image
        const processedImage = await preprocessImage(file)

        // Extract data
        const data = await extractReceiptData(processedImage)

        return data
    } catch (error) {
        console.error('Receipt processing error:', error)
        return {
            date: null,
            time: null,
            amount: null,
            rawText: '',
            confidence: 0,
        }
    }
}

export default {
    extractReceiptData,
    preprocessImage,
    processReceipt,
}