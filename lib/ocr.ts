// lib/ocr.ts
// Created: OCR service using Tesseract.js for receipt text extraction
// Enhanced with advanced preprocessing and fuzzy number matching

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
// CHARACTER CORRECTION MAPS (Fuzzy Matching)
// ===========================================

// Common OCR mistakes in numeric contexts
const NUMERIC_CORRECTIONS: Record<string, string> = {
    'O': '0', 'o': '0', 'Q': '0',
    'l': '1', 'I': '1', 'i': '1', '|': '1', '!': '1',
    'Z': '2', 'z': '2',
    'E': '3',
    'A': '4', 'h': '4',
    'S': '5', 's': '5',
    'G': '6', 'b': '6',
    'T': '7',
    'B': '8',
    'g': '9', 'q': '9',
}

// Characters that commonly appear as noise in OCR
const NOISE_CHARS = /[`~@#$%^&*_=+\\|<>{}[\]]/g

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
    // Updated to handle format like "Total payment      :    2,879,400"
    paymentAmount: [
        // Specific payment keywords (highest priority)
        // Allow OCR errors: tota1, payrnent, etc. Use flexible spacing
        /(?:tota[l1i]\s*pay[mw]ent|tota[l1i]\s*bayar|tota[l1i]\s*dibayar|pembayaran)[^0-9\n]*?:?\s*(?:rp\.?|idr)?\s*([0-9][0-9.,]+)/gi,
        // Indonesian bank payments - allow anything between bank name and colon
        /(?:c[i1l]mb|bca|mand[i1l]r[i1l]|bn[i1l]|br[i1l]|danamon|permata|ocbc|hsbc|maybank)[^\n]*?:\s*(?:rp\.?|idr)?\s*([0-9][0-9.,]+)/gi,
        // E-wallets and cards - more lenient
        /(?:tuna[i1l]|cash|kartu|card|deb[i1l]t|kred[i1l]t|cred[i1l]t|gopay|ovo|dana|shopeepay|qr[i1l]s|go-pay|l[i1l]nkaja)[^\n]*?:\s*(?:rp\.?|idr)?\s*([0-9][0-9.,]+)/gi,
        // Total sales (common on Indonesian receipts)
        /(?:tota[l1i]\s*sa[l1i]es|tota[l1i]\s*penjua[l1i]an)[^0-9\n]*?:?\s*(?:rp\.?|idr)?\s*([0-9][0-9.,]+)/gi,
    ],
    // Fallback amount patterns (lower priority)
    generalAmount: [
        /(?:grand\s*tota[l1i]|tota[l1i]\s*be[l1i]anja|tota[l1i]\s*harga)[^0-9\n]*?:?\s*(?:rp\.?|idr)?\s*([0-9][0-9.,]+)/gi,
        // "Total" at line start with colon separator
        /(?:^|\n)\s*tota[l1i]\s*[:\s]+(?:rp\.?|idr)?\s*([0-9][0-9.,]+)/gim,
        // Simple fallback: any line with colon followed by large number (>100k)
        /:\s*(?:rp\.?|idr)?\s*([0-9][0-9.,]*[0-9]{3})/gi,
    ],
    // Patterns to EXCLUDE (savings, discounts)
    excludeAmount: [
        /(?:saving|hemat|diskon|discount|potongan|off)[:\s]*-?(?:rp\.?|idr)?[\s]*([0-9.,]+)/gi,
        /(?:total\s*saving|total\s*hemat|total\s*diskon)[:\s]*-?(?:rp\.?|idr)?[\s]*([0-9.,]+)/gi,
    ],
}

// ===========================================
// TEXT CORRECTION FUNCTIONS
// ===========================================

/**
 * Fix common OCR mistakes in numeric strings
 * e.g., "1O.OOO" -> "10.000", "2,S00" -> "2,500"
 */
function fixNumericOCRErrors(text: string): string {
    // Only apply corrections to segments that look like numbers
    return text.replace(/[\d\s.,OolIiBbSsGgZzEATQqh|!]+/g, (match) => {
        // If it contains at least one digit, try to fix it
        if (/\d/.test(match)) {
            let fixed = ''
            for (const char of match) {
                if (NUMERIC_CORRECTIONS[char] && /\d/.test(match)) {
                    fixed += NUMERIC_CORRECTIONS[char]
                } else {
                    fixed += char
                }
            }
            return fixed
        }
        return match
    })
}

/**
 * Clean and normalize OCR text
 * Removes noise, normalizes whitespace, fixes common issues
 */
function cleanOCRText(text: string): string {
    let cleaned = text

    // Remove noise characters
    cleaned = cleaned.replace(NOISE_CHARS, ' ')

    // Fix common OCR word errors
    cleaned = cleaned
        .replace(/tota[l1]/gi, 'total')
        .replace(/sa[l1]es/gi, 'sales')
        .replace(/payment/gi, 'payment')
        .replace(/sav[i1]ng/gi, 'saving')
        .replace(/d[i1]skon/gi, 'diskon')
        .replace(/tunai/gi, 'tunai')

    // Normalize multiple spaces/newlines
    cleaned = cleaned.replace(/[ \t]+/g, ' ')
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n')

    // Fix numbers with OCR errors
    cleaned = fixNumericOCRErrors(cleaned)

    return cleaned.trim()
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
    console.log('Excluded amounts (savings/discounts):', Array.from(excludedAmounts))

    // Try payment-specific patterns first (highest priority)
    for (const pattern of PATTERNS.paymentAmount) {
        const matches = text.matchAll(pattern)
        for (const match of matches) {
            const amountStr = match[1] || match[0]
            const amount = parseAmount(amountStr)
            console.log(`Payment pattern matched: "${match[0]}" -> ${amount}`)

            // Filter reasonable receipt amounts and ensure it's not an excluded amount
            if (amount >= 1000 && amount <= 50000000 && !excludedAmounts.has(amount)) {
                console.log(`Returning payment amount: ${amount}`)
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
            console.log(`General pattern matched: "${match[0].substring(0, 50)}..." -> ${amount}`)

            // Filter reasonable amounts and exclude savings
            if (amount >= 1000 && amount <= 50000000 && !excludedAmounts.has(amount)) {
                generalAmounts.push(amount)
            }
        }
    }

    if (generalAmounts.length > 0) {
        console.log('All general amounts found:', generalAmounts)
        // For general amounts, prefer smaller totals (more likely to be actual payment)
        // Large amounts are often pre-discount totals
        generalAmounts.sort((a, b) => a - b)

        // If there are multiple amounts, the smaller ones are more likely actual payment
        // But filter out very small amounts that might be item prices
        const reasonableAmounts = generalAmounts.filter(a => a >= 100000)
        if (reasonableAmounts.length > 0) {
            console.log(`Returning smallest reasonable amount: ${reasonableAmounts[0]}`)
            return reasonableAmounts[0] // Return smallest reasonable amount
        }
        return generalAmounts[0]
    }

    // Last resort: find ALL numbers that look like money amounts (6+ digits)
    console.log('Trying last resort amount extraction...')
    const allAmounts: number[] = []
    const moneyPattern = /([0-9]{1,3}(?:[.,][0-9]{3})+)/g
    const moneyMatches = text.matchAll(moneyPattern)
    for (const match of moneyMatches) {
        const amount = parseAmount(match[1])
        if (amount >= 100000 && amount <= 50000000 && !excludedAmounts.has(amount)) {
            allAmounts.push(amount)
        }
    }

    if (allAmounts.length > 0) {
        // Count occurrences - amounts that appear multiple times are more likely correct
        const countMap = new Map<number, number>()
        for (const amt of allAmounts) {
            countMap.set(amt, (countMap.get(amt) || 0) + 1)
        }
        console.log('Amount frequencies:', Object.fromEntries(countMap))

        // Find amount with highest frequency, or if tied, the smallest
        let bestAmount = allAmounts[0]
        let bestCount = countMap.get(bestAmount) || 0
        for (const [amt, count] of countMap) {
            if (count > bestCount || (count === bestCount && amt < bestAmount)) {
                bestAmount = amt
                bestCount = count
            }
        }
        console.log(`Last resort returning: ${bestAmount} (appeared ${bestCount} times)`)
        return bestAmount
    }

    console.log('No amount found')
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
 * Uses fallback strategy: tries cleaned text first, then raw text
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

        // Try extraction from raw text FIRST (more reliable)
        let date = extractDate(rawText)
        let time = extractTime(rawText)
        let amount = extractAmount(rawText)

        // If raw text didn't work well, try cleaned text as fallback
        const cleanedText = cleanOCRText(rawText)

        if (!date) date = extractDate(cleanedText)
        if (!time) time = extractTime(cleanedText)
        if (!amount) amount = extractAmount(cleanedText)

        const data: Omit<ReceiptOCRData, 'confidence'> = {
            date,
            time,
            amount,
            rawText, // Keep original for debugging
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
 * Apply unsharp mask for subtle sharpening (helps with slightly blurry images)
 */
function applySharpening(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number = 0.3): void {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    const copy = new Uint8ClampedArray(data)

    // Simple unsharp mask: sharpen = original + amount * (original - blur)
    // Using a simplified 3x3 blur kernel
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4

            for (let c = 0; c < 3; c++) { // RGB channels only
                // Get 3x3 neighborhood average (simplified blur)
                let blur = 0
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nidx = ((y + dy) * width + (x + dx)) * 4
                        blur += copy[nidx + c]
                    }
                }
                blur /= 9

                // Apply unsharp mask
                const original = copy[idx + c]
                const sharpened = original + amount * (original - blur)
                data[idx + c] = Math.max(0, Math.min(255, Math.round(sharpened)))
            }
        }
    }

    ctx.putImageData(imageData, 0, 0)
}

/**
 * Pre-process image for better OCR results
 * Features: upscaling for small images, sharpening, contrast enhancement
 * Keeps color info which helps with colored receipts (pink, etc)
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

                let width = img.width
                let height = img.height

                // Determine if upscaling is needed based on image size
                // Small images (< 1500px on longest side) benefit from 2x upscaling
                const longestSide = Math.max(width, height)
                const needsUpscale = longestSide < 1500
                const upscaleFactor = needsUpscale ? 2 : 1

                // Also check file size - small files likely need upscaling
                const fileSizeKB = file.size / 1024
                const smallFile = fileSizeKB < 200 // Files under 200KB

                // Apply upscaling for small images/files
                if (needsUpscale || smallFile) {
                    width = Math.round(width * upscaleFactor)
                    height = Math.round(height * upscaleFactor)
                    console.log(`Upscaling image ${upscaleFactor}x for better OCR (original: ${img.width}x${img.height}, file: ${Math.round(fileSizeKB)}KB)`)
                }

                // Cap at reasonable max size for performance
                const maxSize = 3000
                if (width > maxSize || height > maxSize) {
                    const ratio = Math.min(maxSize / width, maxSize / height)
                    width = Math.round(width * ratio)
                    height = Math.round(height * ratio)
                }

                canvas.width = width
                canvas.height = height

                // Draw image with high-quality scaling
                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = 'high'
                ctx.drawImage(img, 0, 0, width, height)

                // Apply sharpening for upscaled/blurry images
                if (needsUpscale || smallFile) {
                    applySharpening(ctx, width, height, 0.4) // Stronger sharpening for upscaled
                } else {
                    applySharpening(ctx, width, height, 0.2) // Light sharpening for all
                }

                // Get image data for contrast enhancement
                const imageData = ctx.getImageData(0, 0, width, height)
                const data = imageData.data

                // Contrast enhancement (preserves color)
                const contrastFactor = 1.3 // Slightly stronger
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, Math.max(0, contrastFactor * (data[i] - 128) + 128))
                    data[i + 1] = Math.min(255, Math.max(0, contrastFactor * (data[i + 1] - 128) + 128))
                    data[i + 2] = Math.min(255, Math.max(0, contrastFactor * (data[i + 2] - 128) + 128))
                }

                ctx.putImageData(imageData, 0, 0)

                // Return as PNG for better quality (important for upscaled images)
                resolve(canvas.toDataURL('image/png'))
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
 * Full receipt processing pipeline with fallback
 * Tries preprocessed image first, falls back to original if no results
 */
export async function processReceipt(file: File): Promise<ReceiptOCRData> {
    try {
        // First try with light preprocessing
        const processedImage = await preprocessImage(file)
        const data = await extractReceiptData(processedImage)

        // If we got results, return them
        if (data.confidence > 0) {
            console.log('OCR succeeded with preprocessed image')
            return data
        }

        // Fallback: try with original image (no preprocessing)
        console.log('Preprocessed image gave 0% confidence, trying original...')
        const originalData = await extractReceiptData(file)

        // Return whichever has better results
        if (originalData.confidence > data.confidence) {
            console.log('Original image gave better results')
            return originalData
        }

        return data
    } catch (error) {
        console.error('Receipt processing error:', error)

        // Last resort: try original file directly
        try {
            console.log('Error during preprocessing, trying original file...')
            return await extractReceiptData(file)
        } catch {
            return {
                date: null,
                time: null,
                amount: null,
                rawText: '',
                confidence: 0,
            }
        }
    }
}

export default {
    extractReceiptData,
    preprocessImage,
    processReceipt,
}