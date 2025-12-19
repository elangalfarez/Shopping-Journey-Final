// app/mission/[id]/page.tsx
// Created: Mission page with receipt upload, OCR processing, and validation

"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    Camera,
    Upload,
    X,
    Check,
    AlertCircle,
    Loader2,
    RotateCcw,
    Utensils,
    Shirt,
    Clock,
    Receipt,
    Sparkles,
    ChevronRight,
    ImageIcon,
    Zap,
    CheckCircle,
    XCircle,
    FileWarning,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import Header from "@/components/Header"

import { useParticipant } from "@/hooks/useParticipant"
import { processReceipt } from "@/lib/ocr"
import { uploadReceipt, updateMission } from "@/lib/supabase"
import { validateReceiptForMission, receiptFileSchema } from "@/lib/validations"
import { formatRupiah } from "@/lib/utils"
import {
    MISSION_1,
    MISSION_2,
    getMissionConfig,
    VALIDATION,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    PAGE_ROUTES,
} from "@/lib/constants"
import type { ReceiptOCRData, MissionConfig } from "@/lib/types"

// ===========================================
// ANIMATION VARIANTS
// ===========================================

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
}

const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
}

const slideIn = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
}

// ===========================================
// TYPES
// ===========================================

type UploadStep = "select" | "preview" | "processing" | "validation" | "success" | "error"

interface ValidationItem {
    label: string
    value: string | null
    isValid: boolean
    requirement: string
}

// ===========================================
// FILE INPUT COMPONENT
// ===========================================

interface FileInputProps {
    onFileSelect: (file: File) => void
    missionConfig: MissionConfig
}

function FileInput({ onFileSelect, missionConfig }: FileInputProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file
            const result = receiptFileSchema.safeParse(file)
            if (!result.success) {
                alert(result.error.errors[0]?.message || "File tidak valid")
                return
            }
            onFileSelect(file)
        }
    }

    const Icon = missionConfig.id === 1 ? Utensils : Shirt

    return (
        <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="space-y-4"
        >
            {/* Mission info card */}
            <Card variant={missionConfig.id === 1 ? "christmas" : "success"}>
                <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                        <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${missionConfig.id === 1
                                    ? "bg-christmas-red/30"
                                    : "bg-christmas-green/30"
                                }`}
                        >
                            <Icon
                                className={`w-7 h-7 ${missionConfig.id === 1 ? "text-christmas-red" : "text-christmas-green"
                                    }`}
                            />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-white">{missionConfig.fullName}</h2>
                            <p className="text-sm text-gray-400">{missionConfig.description}</p>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="bg-gray-800/50 rounded-xl p-3">
                            <p className="text-xs text-gray-500 mb-1">Min. Belanja</p>
                            <p
                                className={`font-bold ${missionConfig.id === 1 ? "text-christmas-red" : "text-christmas-green"
                                    }`}
                            >
                                {formatRupiah(missionConfig.minAmount)}
                            </p>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-3">
                            <p className="text-xs text-gray-500 mb-1">Min. Waktu</p>
                            <p className="text-white font-bold flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {missionConfig.minTimeDisplay}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Upload area */}
            <Card variant="glass" className="overflow-hidden">
                <CardContent className="p-6">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Receipt className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Upload Struk Belanja</h3>
                        <p className="text-sm text-gray-400">
                            Foto struk harus menunjukkan tanggal, waktu, dan total transaksi
                        </p>
                    </div>

                    {/* Upload buttons */}
                    <div className="space-y-3">
                        {/* Camera button */}
                        <Button
                            onClick={() => cameraInputRef.current?.click()}
                            className="w-full"
                            variant={missionConfig.id === 1 ? "default" : "secondary"}
                            size="lg"
                        >
                            <Camera className="w-5 h-5 mr-2" />
                            Ambil Foto
                        </Button>

                        {/* Gallery button */}
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            className="w-full"
                            size="lg"
                        >
                            <ImageIcon className="w-5 h-5 mr-2" />
                            Pilih dari Galeri
                        </Button>
                    </div>

                    {/* Hidden file inputs */}
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={VALIDATION.receipt.allowedTypes.join(",")}
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {/* File requirements */}
                    <div className="mt-6 p-4 bg-gray-800/30 rounded-xl">
                        <p className="text-xs text-gray-500 mb-2 font-medium">Ketentuan foto:</p>
                        <ul className="text-xs text-gray-500 space-y-1">
                            <li className="flex items-center gap-2">
                                <Check className="w-3 h-3 text-christmas-green" />
                                Format: JPG, PNG, WebP (max 10MB)
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="w-3 h-3 text-christmas-green" />
                                Tanggal struk: 20 Desember 2025
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="w-3 h-3 text-christmas-green" />
                                Pastikan teks terlihat jelas
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

// ===========================================
// IMAGE PREVIEW COMPONENT
// ===========================================

interface ImagePreviewProps {
    file: File
    preview: string
    onConfirm: () => void
    onRetake: () => void
    missionConfig: MissionConfig
}

function ImagePreview({
    file,
    preview,
    onConfirm,
    onRetake,
    missionConfig,
}: ImagePreviewProps) {
    return (
        <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-4"
        >
            <Card variant="glass">
                <CardContent className="p-4">
                    {/* Image preview */}
                    <div className="relative rounded-xl overflow-hidden bg-gray-900 mb-4">
                        <img
                            src={preview}
                            alt="Receipt preview"
                            className="w-full h-auto max-h-[400px] object-contain"
                        />

                        {/* Retake button overlay */}
                        <button
                            onClick={onRetake}
                            className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* File info */}
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                        <span className="truncate max-w-[200px]">{file.name}</span>
                        <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        <Button onClick={onRetake} variant="outline" className="flex-1">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Ganti Foto
                        </Button>
                        <Button
                            onClick={onConfirm}
                            className="flex-1"
                            variant={missionConfig.id === 1 ? "default" : "secondary"}
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            Proses Struk
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

// ===========================================
// PROCESSING COMPONENT
// ===========================================

interface ProcessingProps {
    progress: number
}

function Processing({ progress }: ProcessingProps) {
    return (
        <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className="text-center py-12"
        >
            <div className="relative w-24 h-24 mx-auto mb-6">
                {/* Spinning ring */}
                <div className="absolute inset-0 border-4 border-christmas-gold/30 border-t-christmas-gold rounded-full animate-spin" />

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Receipt className="w-10 h-10 text-christmas-gold" />
                </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Memproses Struk</h3>
            <p className="text-sm text-gray-400 mb-4">Mengekstrak informasi dari gambar...</p>

            {/* Progress bar */}
            <div className="max-w-xs mx-auto">
                <Progress value={progress} variant="default" className="h-2" />
                <p className="text-xs text-gray-500 mt-2">{Math.round(progress)}%</p>
            </div>
        </motion.div>
    )
}

// ===========================================
// VALIDATION RESULTS COMPONENT
// ===========================================

interface ValidationResultsProps {
    ocrData: ReceiptOCRData
    validationItems: ValidationItem[]
    isValid: boolean
    errors: string[]
    onSubmit: () => void
    onRetry: () => void
    isSubmitting: boolean
    missionConfig: MissionConfig
}

function ValidationResults({
    ocrData,
    validationItems,
    isValid,
    errors,
    onSubmit,
    onRetry,
    isSubmitting,
    missionConfig,
}: ValidationResultsProps) {
    return (
        <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-4"
        >
            {/* Result header */}
            <Card variant={isValid ? "success" : "christmas"}>
                <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                        <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center ${isValid ? "bg-christmas-green" : "bg-christmas-red/30"
                                }`}
                        >
                            {isValid ? (
                                <CheckCircle className="w-8 h-8 text-white" />
                            ) : (
                                <FileWarning className="w-8 h-8 text-christmas-red" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">
                                {isValid ? "Struk Valid!" : "Struk Tidak Valid"}
                            </h3>
                            <p className="text-sm text-gray-400">
                                {isValid
                                    ? "Semua ketentuan terpenuhi"
                                    : `${errors.length} ketentuan tidak terpenuhi`}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Extracted data */}
            <Card variant="glass">
                <CardContent className="p-5">
                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-christmas-gold" />
                        Hasil Pemindaian OCR
                    </h4>

                    <div className="space-y-3">
                        {validationItems.map((item, index) => (
                            <div
                                key={index}
                                className={`flex items-center justify-between p-3 rounded-xl ${item.isValid
                                        ? "bg-christmas-green/10 border border-christmas-green/30"
                                        : "bg-christmas-red/10 border border-christmas-red/30"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {item.isValid ? (
                                        <CheckCircle className="w-5 h-5 text-christmas-green" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-christmas-red" />
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-white">{item.label}</p>
                                        <p className="text-xs text-gray-500">{item.requirement}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p
                                        className={`text-sm font-bold ${item.isValid ? "text-christmas-green" : "text-christmas-red"
                                            }`}
                                    >
                                        {item.value || "Tidak terdeteksi"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* OCR confidence */}
                    <div className="mt-4 p-3 bg-gray-800/50 rounded-xl">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Tingkat Kepercayaan OCR</span>
                            <span
                                className={`font-bold ${ocrData.confidence >= 70
                                        ? "text-christmas-green"
                                        : ocrData.confidence >= 40
                                            ? "text-christmas-gold"
                                            : "text-christmas-red"
                                    }`}
                            >
                                {ocrData.confidence}%
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error messages */}
            {errors.length > 0 && (
                <div className="bg-christmas-red/10 border border-christmas-red/30 rounded-xl p-4">
                    <p className="text-sm font-medium text-christmas-red mb-2">
                        Ketentuan yang tidak terpenuhi:
                    </p>
                    <ul className="text-xs text-gray-400 space-y-1">
                        {errors.map((error, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <XCircle className="w-3 h-3 text-christmas-red mt-0.5 flex-shrink-0" />
                                {error}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
                <Button onClick={onRetry} variant="outline" className="flex-1">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Foto Ulang
                </Button>

                {isValid ? (
                    <Button
                        onClick={onSubmit}
                        loading={isSubmitting}
                        className="flex-1"
                        variant={missionConfig.id === 1 ? "default" : "secondary"}
                    >
                        {isSubmitting ? "Menyimpan..." : "Selesaikan Misi"}
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                ) : (
                    <Button
                        onClick={onSubmit}
                        variant="outline"
                        className="flex-1 border-christmas-gold/50 text-christmas-gold hover:bg-christmas-gold/10"
                        disabled={isSubmitting}
                    >
                        Ajukan Tetap
                    </Button>
                )}
            </div>

            {/* Manual review notice for invalid receipts */}
            {!isValid && (
                <p className="text-xs text-gray-500 text-center">
                    Struk yang tidak memenuhi ketentuan akan ditinjau manual oleh panitia
                </p>
            )}
        </motion.div>
    )
}

// ===========================================
// SUCCESS COMPONENT
// ===========================================

interface SuccessProps {
    missionConfig: MissionConfig
    onContinue: () => void
    allComplete: boolean
}

function Success({ missionConfig, onContinue, allComplete }: SuccessProps) {
    return (
        <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            className="text-center py-8"
        >
            {/* Success animation */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="relative inline-block mb-6"
            >
                <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg ${missionConfig.id === 1
                            ? "bg-gradient-to-br from-christmas-red to-red-700 shadow-christmas-red/50"
                            : "bg-gradient-to-br from-christmas-green to-green-700 shadow-christmas-green/50"
                        }`}
                >
                    <Check className="w-12 h-12 text-white" />
                </div>

                {/* Sparkles */}
                <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <Sparkles className="w-8 h-8 text-christmas-gold" />
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h2 className="text-2xl font-bold text-white mb-2">
                    {missionConfig.name} Selesai! 🎉
                </h2>
                <p className="text-gray-400 mb-6">
                    {allComplete
                        ? "Selamat! Anda telah menyelesaikan semua misi!"
                        : "Lanjutkan ke misi berikutnya"}
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <Button
                    onClick={onContinue}
                    size="lg"
                    variant={allComplete ? "gold" : "default"}
                    className="min-w-[200px]"
                >
                    {allComplete ? (
                        <>
                            Klaim Voucher
                            <ChevronRight className="w-5 h-5 ml-1" />
                        </>
                    ) : (
                        <>
                            Kembali ke Dashboard
                            <ChevronRight className="w-5 h-5 ml-1" />
                        </>
                    )}
                </Button>
            </motion.div>
        </motion.div>
    )
}

// ===========================================
// MAIN MISSION PAGE COMPONENT
// ===========================================

export default function MissionPage() {
    const router = useRouter()
    const params = useParams()
    const { toast } = useToast()

    // Parse mission ID from URL
    const missionId = parseInt(params.id as string, 10) as 1 | 2
    const missionConfig = getMissionConfig(missionId)

    // Participant data
    const {
        participant,
        session,
        missions,
        loading: participantLoading,
        refresh,
    } = useParticipant({ requireAuth: true })

    // Get current mission state
    const currentMission = missions.find((m) => m.id === missionId)
    const isAlreadyComplete = currentMission?.status === "completed"

    // Local state
    const [step, setStep] = useState<UploadStep>("select")
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [ocrData, setOcrData] = useState<ReceiptOCRData | null>(null)
    const [ocrProgress, setOcrProgress] = useState(0)
    const [validationErrors, setValidationErrors] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Check if mission is already complete
    useEffect(() => {
        if (!participantLoading && isAlreadyComplete) {
            toast({
                title: "Misi Sudah Selesai",
                description: "Anda sudah menyelesaikan misi ini",
            })
            router.push(PAGE_ROUTES.dashboard)
        }
    }, [participantLoading, isAlreadyComplete, router, toast])

    // Cleanup preview URL on unmount
    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview)
            }
        }
    }, [preview])

    // Handle file selection
    const handleFileSelect = useCallback((selectedFile: File) => {
        setFile(selectedFile)
        setPreview(URL.createObjectURL(selectedFile))
        setStep("preview")
        setOcrData(null)
        setValidationErrors([])
    }, [])

    // Handle image confirmation and start OCR
    const handleConfirmImage = useCallback(async () => {
        if (!file) return

        setStep("processing")
        setOcrProgress(0)

        try {
            // Run OCR with real progress tracking
            const data = await processReceipt(file, (progress) => {
                setOcrProgress(progress)
            })

            setOcrProgress(100)

            // Validate
            const validation = validateReceiptForMission(missionId, {
                date: data.date,
                time: data.time,
                amount: data.amount,
            })

            setOcrData(data)
            setValidationErrors(validation.errors)

            // Short delay before showing results
            setTimeout(() => {
                setStep("validation")
            }, 500)
        } catch (error) {
            console.error("OCR error:", error)
            toast({
                title: "Error",
                description: "Gagal memproses gambar. Silakan coba lagi.",
                variant: "destructive",
            })
            setStep("preview")
        }
    }, [file, missionId, toast])

    // Handle retake/retry
    const handleRetake = useCallback(() => {
        if (preview) {
            URL.revokeObjectURL(preview)
        }
        setFile(null)
        setPreview(null)
        setOcrData(null)
        setValidationErrors([])
        setStep("select")
    }, [preview])

    // Handle submit
    const handleSubmit = useCallback(async () => {
        if (!file || !ocrData || !participant) return

        setIsSubmitting(true)

        try {
            // Upload receipt to storage
            const { url: receiptUrl, error: uploadError } = await uploadReceipt(
                participant.id,
                missionId,
                file
            )

            if (uploadError || !receiptUrl) {
                throw new Error(uploadError || "Upload gagal")
            }

            // Update mission status
            const result = await updateMission(participant.id, missionId, {
                status: "completed",
                receiptUrl,
                amount: ocrData.amount || undefined,
            })

            if (!result.success) {
                throw new Error(result.error || "Gagal menyimpan misi")
            }

            // Refresh participant data
            await refresh()

            // Show success
            setStep("success")

            toast({
                title: "Berhasil!",
                description: SUCCESS_MESSAGES.missionComplete,
                variant: "success",
            })
        } catch (error) {
            console.error("Submit error:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : ERROR_MESSAGES.serverError,
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }, [file, ocrData, participant, missionId, refresh, toast])

    // Handle continue after success
    const handleContinue = useCallback(() => {
        // Check if all missions are now complete
        const otherMission = missions.find((m) => m.id !== missionId)
        const allComplete = otherMission?.status === "completed"

        if (allComplete) {
            router.push(PAGE_ROUTES.success)
        } else {
            router.push(PAGE_ROUTES.dashboard)
        }
    }, [missions, missionId, router])

    // Build validation items for display
    const validationItems: ValidationItem[] = ocrData
        ? [
            {
                label: "Tanggal",
                value: ocrData.date || "—",
                isValid: !validationErrors.some((e) => e.includes("tanggal")),
                requirement: "20 Desember 2025",
            },
            {
                label: "Waktu Transaksi",
                value: ocrData.time || "—",
                isValid: !validationErrors.some((e) => e.includes("Waktu")),
                requirement: `≥ ${missionConfig.minTimeDisplay}`,
            },
            {
                label: "Total Belanja",
                value: ocrData.amount ? formatRupiah(ocrData.amount) : "—",
                isValid: !validationErrors.some((e) => e.includes("Jumlah")),
                requirement: `≥ ${formatRupiah(missionConfig.minAmount)}`,
            },
        ]
        : []

    // Check if all missions complete after this one
    const otherMission = missions.find((m) => m.id !== missionId)
    const willCompleteAll = otherMission?.status === "completed"

    // Loading state
    if (participantLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0f0f] to-[#0a0a0f] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-christmas-red/30 border-t-christmas-red rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white">Memuat...</p>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`min-h-screen bg-gradient-to-b ${missionConfig.id === 1
                    ? "from-[#0a0a0f] via-[#1a0f0f] to-[#0a0a0f]"
                    : "from-[#0a0a0f] via-[#0f1a0f] to-[#0a0a0f]"
                }`}
        >
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div
                    className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[100px] ${missionConfig.id === 1 ? "bg-christmas-red/15" : "bg-christmas-green/15"
                        }`}
                />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-christmas-gold/5 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <Header
                title={missionConfig.name}
                showBack
                onBack={() => router.push(PAGE_ROUTES.dashboard)}
            />

            {/* Content */}
            <main className="relative z-10 p-4 pb-8 max-w-lg mx-auto">
                <AnimatePresence mode="wait">
                    {/* Step: Select file */}
                    {step === "select" && (
                        <FileInput
                            key="select"
                            onFileSelect={handleFileSelect}
                            missionConfig={missionConfig}
                        />
                    )}

                    {/* Step: Preview image */}
                    {step === "preview" && file && preview && (
                        <ImagePreview
                            key="preview"
                            file={file}
                            preview={preview}
                            onConfirm={handleConfirmImage}
                            onRetake={handleRetake}
                            missionConfig={missionConfig}
                        />
                    )}

                    {/* Step: Processing OCR */}
                    {step === "processing" && (
                        <Processing key="processing" progress={ocrProgress} />
                    )}

                    {/* Step: Validation results */}
                    {step === "validation" && ocrData && (
                        <ValidationResults
                            key="validation"
                            ocrData={ocrData}
                            validationItems={validationItems}
                            isValid={validationErrors.length === 0}
                            errors={validationErrors}
                            onSubmit={handleSubmit}
                            onRetry={handleRetake}
                            isSubmitting={isSubmitting}
                            missionConfig={missionConfig}
                        />
                    )}

                    {/* Step: Success */}
                    {step === "success" && (
                        <Success
                            key="success"
                            missionConfig={missionConfig}
                            onContinue={handleContinue}
                            allComplete={willCompleteAll}
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}