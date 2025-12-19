// app/global-error.tsx
// Created: Global error handler for uncaught errors

"use client"

import { Inter } from "next/font/google"
import { AlertTriangle, RefreshCw } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

interface GlobalErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    return (
        <html lang="id" className="dark">
            <body className={`${inter.className} bg-[#0a0a0f] text-white min-h-screen`}>
                <div className="min-h-screen flex items-center justify-center p-4">
                    {/* Background */}
                    <div className="fixed inset-0 pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[100px]" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 max-w-md w-full text-center">
                        {/* Error icon */}
                        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-500/30">
                            <AlertTriangle className="w-12 h-12 text-red-500" />
                        </div>

                        {/* Message */}
                        <h1 className="text-2xl font-bold mb-3">
                            Terjadi Kesalahan Sistem
                        </h1>
                        <p className="text-gray-400 mb-8">
                            Maaf, terjadi kesalahan yang tidak terduga pada aplikasi.
                            Tim kami telah diberitahu dan sedang menangani masalah ini.
                        </p>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={reset}
                                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Coba Lagi
                            </button>

                            <button
                                onClick={() => window.location.href = "/"}
                                className="inline-flex items-center justify-center gap-2 border-2 border-gray-700 hover:border-gray-600 text-gray-300 font-semibold py-3 px-6 rounded-xl transition-colors"
                            >
                                Kembali ke Beranda
                            </button>
                        </div>

                        {/* Error digest for debugging */}
                        {error.digest && (
                            <p className="text-xs text-gray-600 mt-8">
                                Error ID: {error.digest}
                            </p>
                        )}
                    </div>
                </div>
            </body>
        </html>
    )
}