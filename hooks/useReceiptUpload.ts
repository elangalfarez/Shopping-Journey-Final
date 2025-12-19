// hooks/useReceiptUpload.ts
// Created: Receipt upload and OCR processing hook

"use client"

import { useState, useCallback } from 'react'
import { processReceipt } from '@/lib/ocr'
import { uploadReceipt, updateMission } from '@/lib/supabase'
import { validateReceiptForMission, receiptFileSchema } from '@/lib/validations'
import { VALIDATION, ERROR_MESSAGES } from '@/lib/constants'
import type { ReceiptOCRData, MissionUpdateResult } from '@/lib/types'

interface UseReceiptUploadOptions {
    participantId: string
    missionId: 1 | 2
    onSuccess?: (result: MissionUpdateResult) => void
    onError?: (error: string) => void
}

interface UseReceiptUploadReturn {
    // State
    file: File | null
    preview: string | null
    ocrData: ReceiptOCRData | null
    validationErrors: string[]
    isUploading: boolean
    isProcessing: boolean
    error: string | null
    isComplete: boolean

    // Actions
    selectFile: (file: File) => Promise<void>
    clearFile: () => void
    submitReceipt: () => Promise<MissionUpdateResult | null>
    retryOCR: () => Promise<void>
}

/**
 * Hook for handling receipt upload, OCR, and validation
 */
export function useReceiptUpload(options: UseReceiptUploadOptions): UseReceiptUploadReturn {
    const { participantId, missionId, onSuccess, onError } = options

    // File state
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)

    // OCR state
    const [ocrData, setOcrData] = useState<ReceiptOCRData | null>(null)
    const [validationErrors, setValidationErrors] = useState<string[]>([])

    // Loading state
    const [isUploading, setIsUploading] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    // Error state
    const [error, setError] = useState<string | null>(null)
    const [isComplete, setIsComplete] = useState(false)

    /**
     * Clear all state
     */
    const clearFile = useCallback(() => {
        if (preview) {
            URL.revokeObjectURL(preview)
        }
        setFile(null)
        setPreview(null)
        setOcrData(null)
        setValidationErrors([])
        setError(null)
        setIsComplete(false)
    }, [preview])

    /**
     * Process file with OCR
     */
    const processFile = useCallback(async (selectedFile: File) => {
        setIsProcessing(true)
        setError(null)
        setValidationErrors([])

        try {
            // Run OCR
            const data = await processReceipt(selectedFile)
            setOcrData(data)

            // Validate extracted data
            const validation = validateReceiptForMission(missionId, {
                date: data.date,
                time: data.time,
                amount: data.amount,
            })

            setValidationErrors(validation.errors)

            if (data.confidence < 30) {
                setError('Gambar sulit dibaca. Coba dengan foto yang lebih jelas.')
            }
        } catch (err) {
            console.error('OCR processing error:', err)
            setError('Gagal memproses gambar struk')
        } finally {
            setIsProcessing(false)
        }
    }, [missionId])

    /**
     * Select and validate file
     */
    const selectFile = useCallback(async (selectedFile: File) => {
        // Clear previous state
        clearFile()

        // Validate file
        const fileValidation = receiptFileSchema.safeParse(selectedFile)
        if (!fileValidation.success) {
            setError(fileValidation.error.errors[0]?.message || ERROR_MESSAGES.receiptInvalidType)
            return
        }

        // Set file and preview
        setFile(selectedFile)
        const previewUrl = URL.createObjectURL(selectedFile)
        setPreview(previewUrl)

        // Process with OCR
        await processFile(selectedFile)
    }, [clearFile, processFile])

    /**
     * Retry OCR processing
     */
    const retryOCR = useCallback(async () => {
        if (!file) return
        await processFile(file)
    }, [file, processFile])

    /**
     * Submit receipt (upload + update mission)
     */
    const submitReceipt = useCallback(async (): Promise<MissionUpdateResult | null> => {
        if (!file || !ocrData) {
            setError(ERROR_MESSAGES.receiptRequired)
            return null
        }

        // Check validation errors
        if (validationErrors.length > 0) {
            setError('Struk tidak memenuhi syarat. Periksa kembali.')
            return null
        }

        setIsUploading(true)
        setError(null)

        try {
            // Upload file to storage
            const { url: receiptUrl, error: uploadError } = await uploadReceipt(
                participantId,
                missionId,
                file
            )

            if (uploadError || !receiptUrl) {
                throw new Error(uploadError || 'Upload gagal')
            }

            // Update mission status
            const result = await updateMission(participantId, missionId, {
                status: 'completed',
                receiptUrl,
                amount: ocrData.amount || undefined,
            })

            if (!result.success) {
                throw new Error(result.error || 'Gagal menyimpan misi')
            }

            setIsComplete(true)
            onSuccess?.(result)

            return result
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.serverError
            setError(errorMessage)
            onError?.(errorMessage)
            return null
        } finally {
            setIsUploading(false)
        }
    }, [file, ocrData, validationErrors, participantId, missionId, onSuccess, onError])

    return {
        file,
        preview,
        ocrData,
        validationErrors,
        isUploading,
        isProcessing,
        error,
        isComplete,
        selectFile,
        clearFile,
        submitReceipt,
        retryOCR,
    }
}

export default useReceiptUpload