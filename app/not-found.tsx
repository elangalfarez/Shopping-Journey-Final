// app/not-found.tsx
// Created: 404 Not Found page for Shopping Journey

import Link from "next/link"
import { Home, Search, TreePine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0f0f] to-[#0a0a0f] flex items-center justify-center p-4">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-christmas-red/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-christmas-green/10 rounded-full blur-[100px]" />
            </div>

            <Card variant="glass" className="max-w-md w-full relative z-10">
                <CardContent className="p-8 text-center">
                    {/* 404 illustration */}
                    <div className="relative mb-6">
                        <div className="text-8xl font-bold text-gradient-christmas opacity-20">
                            404
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 bg-christmas-gold/20 rounded-full flex items-center justify-center">
                                <Search className="w-10 h-10 text-christmas-gold" />
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    <h2 className="text-xl font-bold text-white mb-2">
                        Halaman Tidak Ditemukan
                    </h2>
                    <p className="text-gray-400 text-sm mb-6">
                        Sepertinya halaman yang Anda cari tidak ada atau telah dipindahkan.
                    </p>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Link href="/" className="block">
                            <Button className="w-full">
                                <Home className="w-4 h-4 mr-2" />
                                Kembali ke Beranda
                            </Button>
                        </Link>

                        <Link href="/dashboard" className="block">
                            <Button variant="outline" className="w-full">
                                <TreePine className="w-4 h-4 mr-2" />
                                Dashboard Saya
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}