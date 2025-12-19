// components/TermsModal.tsx
// Created: Terms & Conditions modal component for registration flow

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, CheckCircle, ScrollText } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

// ===========================================
// TERMS DATA
// ===========================================

const TERMS = [
    "Program Shopping Journey berlaku pada tanggal 20 Desember 2025 mulai pukul 20.00 - 00.00 WIB.",
    "Program ini hanya berlaku untuk 100 peserta pertama yang berhasil menyelesaikan kedua misi.",
    "Peserta wajib mendaftar melalui aplikasi Shopping Journey dengan mengisi nama lengkap dan nomor WhatsApp yang aktif.",
    "Setiap nomor telepon hanya dapat didaftarkan satu kali.",
    "Misi 1: Belanja di tenant Food & Beverage dengan minimum transaksi Rp 150.000 (sebelum pajak dan service charge). Transaksi harus dilakukan pada pukul 19.30 WIB atau setelahnya.",
    "Misi 2: Belanja di tenant Fashion & Accessories dengan minimum transaksi Rp 250.000 (sebelum pajak dan service charge). Transaksi harus dilakukan pada pukul 20.00 WIB atau setelahnya.",
    "Struk belanja harus menunjukkan tanggal 20 Desember 2025 dan waktu transaksi yang sesuai dengan ketentuan masing-masing misi.",
    "Peserta wajib mengunggah foto struk yang jelas dan dapat dibaca. Struk yang buram atau tidak terbaca akan ditolak.",
    "Setiap struk hanya dapat digunakan untuk satu misi. Struk yang sama tidak dapat digunakan untuk kedua misi.",
    "Peserta yang telah menyelesaikan kedua misi akan mendapatkan kode QR unik untuk penukaran voucher.",
    "Voucher senilai Rp 100.000 dapat ditukarkan di Counter CS VIP dengan menunjukkan kode QR dari aplikasi.",
    "Penukaran voucher hanya dapat dilakukan pada tanggal 20 Desember 2025 pukul 20.00 - 00.00 WIB.",
    "Voucher tidak dapat ditukarkan dengan uang tunai dan tidak dapat digabungkan dengan promo lainnya.",
    "Satu peserta hanya berhak mendapatkan satu voucher.",
    "Keputusan panitia bersifat final dan tidak dapat diganggu gugat.",
    "Panitia berhak mendiskualifikasi peserta yang terbukti melakukan kecurangan.",
    "Dengan mendaftar, peserta dianggap telah membaca dan menyetujui seluruh syarat dan ketentuan yang berlaku.",
    "Supermal Karawaci berhak mengubah syarat dan ketentuan sewaktu-waktu tanpa pemberitahuan terlebih dahulu.",
    "Untuk informasi lebih lanjut, silakan hubungi Customer Service Supermal Karawaci.",
]

// ===========================================
// COMPONENT PROPS
// ===========================================

interface TermsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAgree?: () => void
}

// ===========================================
// MAIN COMPONENT
// ===========================================

export function TermsModal({ open, onOpenChange, onAgree }: TermsModalProps) {
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement
        const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50
        if (isAtBottom && !hasScrolledToBottom) {
            setHasScrolledToBottom(true)
        }
    }

    const handleAgree = () => {
        onAgree?.()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-xl max-h-[90vh] flex flex-col p-0 gap-0">
                {/* Header */}
                <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4 border-b border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-christmas-red/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-christmas-red" />
                        </div>
                        <div>
                            <DialogTitle className="text-base sm:text-lg">
                                Syarat & Ketentuan
                            </DialogTitle>
                            <DialogDescription className="text-xs sm:text-sm">
                                Shopping Journey - Christmas Super Midnight Sale 2025
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Scrollable Terms Content */}
                <div className="flex-1 min-h-0 overflow-hidden">
                    <ScrollArea className="h-full max-h-[50vh] sm:max-h-[55vh]">
                        <div
                            className="p-4 sm:p-6 pt-4"
                            onScroll={handleScroll}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <ScrollText className="w-4 h-4 text-christmas-green" />
                                <h4 className="text-sm font-semibold text-white">Ketentuan Program</h4>
                            </div>

                            <ol className="space-y-3">
                                {TERMS.map((term, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="flex gap-2 sm:gap-3"
                                    >
                                        <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-christmas-red/20 text-christmas-red rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold">
                                            {index + 1}
                                        </span>
                                        <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                                            {term}
                                        </p>
                                    </motion.li>
                                ))}
                            </ol>

                            {/* Closing statement */}
                            <div className="mt-6 p-3 sm:p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                                <p className="text-[10px] sm:text-xs text-gray-400 text-center">
                                    Dengan mengikuti program ini, peserta dinyatakan telah membaca,
                                    memahami, dan menyetujui seluruh syarat dan ketentuan yang berlaku.
                                </p>
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                {/* Footer with Actions */}
                <DialogFooter className="p-4 sm:p-6 pt-4 border-t border-gray-700/50 flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="w-full sm:w-auto order-2 sm:order-1"
                    >
                        Tutup
                    </Button>
                    <Button
                        onClick={handleAgree}
                        className="w-full sm:w-auto order-1 sm:order-2"
                    >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Saya Setuju
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default TermsModal
