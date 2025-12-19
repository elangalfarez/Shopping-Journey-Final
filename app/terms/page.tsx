// app/terms/page.tsx
// Created: Terms and conditions page for Shopping Journey

"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, FileText, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Header from "@/components/Header"

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
}

export default function TermsPage() {
    const router = useRouter()

    const terms = [
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0f0f] to-[#0a0a0f]">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-christmas-red/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-christmas-green/5 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <Header
                title="Syarat & Ketentuan"
                showBack
                onBack={() => router.back()}
            />

            {/* Content */}
            <main className="relative z-10 p-4 pb-8 max-w-2xl mx-auto">
                <motion.div
                    initial="initial"
                    animate="animate"
                    variants={fadeInUp}
                    transition={{ duration: 0.4 }}
                >
                    {/* Header card */}
                    <Card variant="christmas" className="mb-6">
                        <CardContent className="p-6 text-center">
                            <div className="w-16 h-16 bg-christmas-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-christmas-red" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">
                                Shopping Journey
                            </h2>
                            <p className="text-gray-400 text-sm">
                                Christmas Super Midnight Sale 2025
                            </p>
                            <p className="text-gray-500 text-xs mt-2">
                                Supermal Karawaci
                            </p>
                        </CardContent>
                    </Card>

                    {/* Terms list */}
                    <Card variant="glass">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-christmas-green" />
                                Ketentuan Program
                            </h3>

                            <ol className="space-y-4">
                                {terms.map((term, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="flex gap-3"
                                    >
                                        <span className="flex-shrink-0 w-6 h-6 bg-christmas-red/20 text-christmas-red rounded-full flex items-center justify-center text-xs font-bold">
                                            {index + 1}
                                        </span>
                                        <p className="text-gray-300 text-sm leading-relaxed">
                                            {term}
                                        </p>
                                    </motion.li>
                                ))}
                            </ol>

                            {/* Closing statement */}
                            <div className="mt-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                                <p className="text-xs text-gray-400 text-center">
                                    Dengan mengikuti program ini, peserta dinyatakan telah membaca,
                                    memahami, dan menyetujui seluruh syarat dan ketentuan yang berlaku.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Back button */}
                    <div className="mt-6">
                        <Button
                            onClick={() => router.back()}
                            variant="outline"
                            className="w-full"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </Button>
                    </div>
                </motion.div>
            </main>
        </div>
    )
}