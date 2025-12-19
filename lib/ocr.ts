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
    // Date patterns (various formats)
    date: [
        /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/g, // DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
        /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/g, // YYYY-MM-DD
        /(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s*['']?(\d{2,4})?/gi,
    ],

    // Time patterns (various formats)
    time: [
        /(\d{1,2})[:\.](\d{2})(?:[:\.](\d{2}))?\s*(am|pm)?/gi, // HH:MM, HH.MM, HH:MM:SS
        /(?:jam|time|waktu)[:\s]*(\d{1,2})[:\.](\d{2})/gi, // Prefixed with "jam", "time", etc.
        /(\d{2})(\d{2})\s*(?:wib|wita|wit)?/gi, // HHMM format
    ],

    // Amount patterns (Indonesian Rupiah)
    amount: [
        /(?:total|grand\s*total|jumlah|amount|subtotal|sub\s*total)[:\s]*(?:rp\.?|idr)?[\s]*([0-9.,]+)/gi,
        /(?:rp\.?|idr)[\s]*([0-9.,]+)/gi, // Rp 150.000 or IDR 150,000
        /([0-9]{1,3}(?:[.,][0-9]{3})+)(?:\s*(?:rp|idr|rupiah))?/gi, // 150.000 or 150,000
    ],
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Extract date from OCR text
 */
function extractDate(text: string): string | null {
    for (const pattern of PATTERNS.date) {
        const matches = text.matchAll(pattern)
        for (const match of matches) {
            // Return the full match
            return match[0]
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
 * Extract amount from OCR text
 */
function extractAmount(text: string): number | null {
    const amounts: number[] = []

    for (const pattern of PATTERNS.amount) {
        const matches = text.matchAll(pattern)
        for (const match of matches) {
            const amountStr = match[1] || match[0]
            const amount = parseAmount(amountStr)

            // Filter reasonable receipt amounts (1000 - 10,000,000 IDR)
            if (amount >= 1000 && amount <= 10000000) {
                amounts.push(amount)
            }
        }
    }

    if (amounts.length === 0) return null

    // Return the largest amount (usually the total)
    return Math.max(...amounts)
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