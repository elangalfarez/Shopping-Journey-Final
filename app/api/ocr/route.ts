// app/api/ocr/route.ts
// Created: API endpoint for server-side OCR processing (optional fallback)

import { NextRequest, NextResponse } from "next/server"
import { ERROR_MESSAGES, VALIDATION } from "@/lib/constants"

// Note: This is a placeholder for server-side OCR
// In production, you might use:
// - Google Cloud Vision API
// - AWS Textract
// - Azure Computer Vision
// - Self-hosted Tesseract

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get("file") as File | null

        if (!file) {
            return NextResponse.json(
                {
                    success: false,
                    error: "File gambar diperlukan",
                },
                { status: 400 }
            )
        }

        // Validate file type
        const allowedTypes = VALIDATION.receipt.allowedTypes
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Format file tidak didukung. Gunakan: ${allowedTypes.join(", ")}`,
                },
                { status: 400 }
            )
        }

        // Validate file size
        const maxSize = VALIDATION.receipt.maxSize
        if (file.size > maxSize) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Ukuran file terlalu besar. Maksimal ${maxSize / 1024 / 1024}MB`,
                },
                { status: 400 }
            )
        }

        // For now, return a message indicating client-side OCR should be used
        // This endpoint can be implemented with server-side OCR service if needed
        return NextResponse.json({
            success: false,
            error: "Server-side OCR belum diaktifkan. Gunakan client-side OCR.",
            useClientOCR: true,
        })

        // Example implementation with external OCR service:
        /*
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64 = buffer.toString('base64')
    
        // Call external OCR API (e.g., Google Cloud Vision)
        const visionResponse = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requests: [{
                image: { content: base64 },
                features: [{ type: 'TEXT_DETECTION' }]
              }]
            })
          }
        )
    
        const visionData = await visionResponse.json()
        const text = visionData.responses[0]?.fullTextAnnotation?.text || ''
    
        // Extract date, time, amount from text
        const ocrData = extractReceiptData(text)
    
        return NextResponse.json({
          success: true,
          data: ocrData,
        })
        */
    } catch (error) {
        console.error("OCR API error:", error)
        return NextResponse.json(
            {
                success: false,
                error: ERROR_MESSAGES.serverError,
            },
            { status: 500 }
        )
    }
}