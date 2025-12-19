// app/success/page.tsx
// Created: Success page with QR code for voucher redemption

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import QRCode from "react-qr-code"
import {
    Gift,
    Check,
    Copy,
    Download,
    MapPin,
    Clock,
    ChevronLeft,
    Sparkles,
    AlertTriangle,
    RefreshCw,
    Share2,
    CheckCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import Header from "@/components/Header"

import { useParticipant } from "@/hooks/useParticipant"
import { formatRupiah } from "@/lib/utils"
import { EVENT_CONFIG, PAGE_ROUTES } from "@/lib/constants"

// ===========================================
// ANIMATION VARIANTS
// ===========================================

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
}

const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
}

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
}

// ===========================================
// MAIN COMPONENT
// ===========================================

export default function SuccessPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [copied, setCopied] = useState(false)

    const {
        participant,
        session,
        loading,
        error,
        allMissionsComplete,
        refresh,
    } = useParticipant({ requireAuth: true, realtime: true })

    // Redirect if not eligible
    useEffect(() => {
        if (!loading && participant && !allMissionsComplete) {
            toast({
                title: "Belum Selesai",
                description: "Selesaikan semua misi terlebih dahulu",
                variant: "destructive",
            })
            router.push(PAGE_ROUTES.dashboard)
        }
    }, [loading, participant, allMissionsComplete, router, toast])

    // Copy redemption code
    const handleCopy = async () => {
        if (!participant?.redemption_code) return

        try {
            await navigator.clipboard.writeText(participant.redemption_code)
            setCopied(true)
            toast({
                title: "Berhasil Disalin",
                description: "Kode redemption telah disalin ke clipboard",
            })
            setTimeout(() => setCopied(false), 3000)
        } catch (err) {
            toast({
                title: "Gagal Menyalin",
                description: "Silakan salin kode secara manual",
                variant: "destructive",
            })
        }
    }

    // Share functionality
    const handleShare = async () => {
        if (!participant?.redemption_code) return

        const shareData = {
            title: "Shopping Journey - Voucher Redemption",
            text: `Kode Voucher Saya: ${participant.redemption_code}\n\nTukarkan di ${EVENT_CONFIG.redemptionLocation}`,
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                await navigator.clipboard.writeText(shareData.text)
                toast({
                    title: "Disalin ke Clipboard",
                    description: "Info voucher telah disalin",
                })
            }
        } catch (err) {
            // User cancelled share
        }
    }

    // Download QR code
    const handleDownloadQR = () => {
        const svg = document.getElementById("qr-code")
        if (!svg) return

        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()

        img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx?.drawImage(img, 0, 0)

            const link = document.createElement("a")
            link.download = `shopping-journey-voucher-${participant?.redemption_code}.png`
            link.href = canvas.toDataURL("image/png")
            link.click()

            toast({
                title: "QR Code Tersimpan",
                description: "Gambar QR code telah diunduh",
            })
        }

        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
    }

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0f0f] to-[#0a0a0f] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-christmas-gold/30 border-t-christmas-gold rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white">Memuat voucher...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0f0f] to-[#0a0a0f] flex items-center justify-center p-4">
                <Card variant="christmas" className="max-w-md w-full">
                    <CardContent className="p-6 text-center">
                        <AlertTriangle className="w-12 h-12 text-christmas-red mx-auto mb-4" />
                        <h2 className="text-lg font-bold text-white mb-2">Terjadi Kesalahan</h2>
                        <p className="text-gray-400 text-sm mb-4">{error}</p>
                        <Button onClick={refresh} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Coba Lagi
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Check if already redeemed
    const isRedeemed = participant?.redemption_status === "redeemed"

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f1a0f] to-[#0a0a0f]">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-christmas-gold/15 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-christmas-green/10 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <Header
                title="Voucher Anda"
                showBack
                onBack={() => router.push(PAGE_ROUTES.dashboard)}
            />

            {/* Content */}
            <main className="relative z-10 p-4 pb-8 max-w-lg mx-auto">
                <motion.div
                    initial="initial"
                    animate="animate"
                    variants={staggerContainer}
                    className="space-y-6"
                >
                    {/* Success badge */}
                    <motion.div variants={fadeInUp} className="text-center">
                        <Badge variant="success" className="text-sm px-4 py-1.5">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {isRedeemed ? "Sudah Ditukar" : "Semua Misi Selesai!"}
                        </Badge>
                    </motion.div>

                    {/* QR Code Card */}
                    <motion.div variants={scaleIn}>
                        <Card
                            variant={isRedeemed ? "glass" : "gold"}
                            className={isRedeemed ? "opacity-75" : ""}
                        >
                            <CardContent className="p-6">
                                {/* Voucher header */}
                                <div className="text-center mb-6">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Gift className="w-6 h-6 text-christmas-gold" />
                                        <h2 className="text-xl font-bold text-white">Cash Voucher</h2>
                                    </div>
                                    <div className="text-3xl font-bold text-christmas-gold">
                                        {formatRupiah(EVENT_CONFIG.voucherAmount)}
                                    </div>
                                </div>

                                {/* QR Code */}
                                <div className="relative bg-white rounded-2xl p-4 mb-6">
                                    {participant?.redemption_code && (
                                        <QRCode
                                            id="qr-code"
                                            value={participant.redemption_code}
                                            size={200}
                                            level="H"
                                            className="w-full h-auto max-w-[200px] mx-auto"
                                        />
                                    )}

                                    {/* Redeemed overlay */}
                                    {isRedeemed && (
                                        <div className="absolute inset-0 bg-white/90 rounded-2xl flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-christmas-green rounded-full flex items-center justify-center mx-auto mb-2">
                                                    <Check className="w-10 h-10 text-white" />
                                                </div>
                                                <p className="text-christmas-green font-bold">Sudah Ditukar</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Redemption code */}
                                <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
                                    <p className="text-xs text-gray-400 text-center mb-2">Kode Voucher</p>
                                    <div className="flex items-center justify-center gap-2">
                                        <code className="text-xl font-mono font-bold text-christmas-gold tracking-wider">
                                            {participant?.redemption_code || "—"}
                                        </code>
                                        {!isRedeemed && (
                                            <button
                                                onClick={handleCopy}
                                                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                                            >
                                                {copied ? (
                                                    <Check className="w-4 h-4 text-christmas-green" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-gray-400" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Participant info */}
                                <div className="text-center text-sm">
                                    <p className="text-gray-400">Untuk</p>
                                    <p className="text-white font-medium">{session?.full_name}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Action buttons */}
                    {!isRedeemed && (
                        <motion.div variants={fadeInUp} className="flex gap-3">
                            <Button onClick={handleDownloadQR} variant="outline" className="flex-1">
                                <Download className="w-4 h-4 mr-2" />
                                Simpan QR
                            </Button>
                            <Button onClick={handleShare} variant="outline" className="flex-1">
                                <Share2 className="w-4 h-4 mr-2" />
                                Bagikan
                            </Button>
                        </motion.div>
                    )}

                    {/* Redemption instructions */}
                    <motion.div variants={fadeInUp}>
                        <Card variant="glass">
                            <CardContent className="p-5">
                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-christmas-gold" />
                                    Cara Penukaran
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-christmas-gold/20 rounded-full flex items-center justify-center">
                                            <MapPin className="w-4 h-4 text-christmas-gold" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">Lokasi</p>
                                            <p className="text-xs text-gray-400">
                                                {EVENT_CONFIG.redemptionLocation}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-christmas-gold/20 rounded-full flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-christmas-gold" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">Waktu</p>
                                            <p className="text-xs text-gray-400">
                                                20 Desember 2025, {EVENT_CONFIG.startTime} - {EVENT_CONFIG.endTime} WIB
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-christmas-gold/20 rounded-full flex items-center justify-center">
                                            <Gift className="w-4 h-4 text-christmas-gold" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">Langkah</p>
                                            <ol className="text-xs text-gray-400 list-decimal list-inside space-y-1 mt-1">
                                                <li>Tunjukkan QR code ini ke petugas</li>
                                                <li>Petugas akan memverifikasi kode</li>
                                                <li>Terima voucher cash Anda</li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Important notice */}
                    <motion.div variants={fadeInUp}>
                        <div className="bg-christmas-red/10 border border-christmas-red/30 rounded-xl p-4">
                            <div className="flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-christmas-red flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-christmas-red mb-1">Penting!</p>
                                    <ul className="text-xs text-gray-400 space-y-1">
                                        <li>• Voucher hanya dapat ditukar 1x</li>
                                        <li>• Simpan screenshot QR code sebagai cadangan</li>
                                        <li>• Voucher hangus jika tidak ditukar pada waktu yang ditentukan</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Back to dashboard */}
                    <motion.div variants={fadeInUp}>
                        <Button
                            onClick={() => router.push(PAGE_ROUTES.dashboard)}
                            variant="ghost"
                            className="w-full"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Kembali ke Dashboard
                        </Button>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    )
}