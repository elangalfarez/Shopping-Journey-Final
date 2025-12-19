// app/error.tsx
// Created: Global error boundary for Shopping Journey

"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log error to console in development
        console.error("Application error:", error)
    }, [error])

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0f0f] to-[#0a0a0f] flex items-center justify-center p-4">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-christmas-red/10 rounded-full blur-[100px]" />
            </div>

            <Card variant="christmas" className="max-w-md w-full relative z-10">
                <CardContent className="p-8 text-center">
                    {/* Error icon */}
                    <div className="w-20 h-20 bg-christmas-red/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-10 h-10 text-christmas-red" />
                    </div>

                    {/* Error message */}
                    <h2 className="text-xl font-bold text-white mb-2">
                        Terjadi Kesalahan
                    </h2>
                    <p className="text-gray-400 text-sm mb-6">
                        Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi atau kembali ke halaman utama.
                    </p>

                    {/* Error details (development only) */}
                    {process.env.NODE_ENV === "development" && (
                        <div className="bg-gray-800/50 rounded-lg p-3 mb-6 text-left">
                            <p className="text-xs text-gray-500 font-mono break-all">
                                {error.message}
                            </p>
                            {error.digest && (
                                <p className="text-xs text-gray-600 mt-1">
                                    Digest: {error.digest}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        <Button
                            onClick={() => (window.location.href = "/")}
                            variant="outline"
                            className="flex-1"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Beranda
                        </Button>
                        <Button
                            onClick={reset}
                            className="flex-1"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Coba Lagi
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}