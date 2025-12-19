// app/admin/login/page.tsx
// Created: Admin login page with password authentication

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, Eye, EyeOff, Shield, AlertCircle, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

import { setLocalStorage, getLocalStorage } from "@/lib/utils"
import { STORAGE_KEYS, API_ROUTES } from "@/lib/constants"

// ===========================================
// ANIMATION VARIANTS
// ===========================================

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
}

// ===========================================
// MAIN COMPONENT
// ===========================================

export default function AdminLoginPage() {
    const router = useRouter()
    const { toast } = useToast()

    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Check for existing admin session
    useEffect(() => {
        const session = getLocalStorage<string>(STORAGE_KEYS.adminSession, "")
        if (session) {
            router.push("/admin/dashboard")
        }
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!password) {
            setError("Password wajib diisi")
            return
        }

        setLoading(true)

        try {
            // Call admin login API
            const response = await fetch(API_ROUTES.adminLogin, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                setError(data.error || "Password salah")
                setLoading(false)
                return
            }

            // Save admin session
            setLocalStorage(STORAGE_KEYS.adminSession, data.token || "authenticated")

            toast({
                title: "Login Berhasil",
                description: "Selamat datang, Admin!",
                variant: "success",
            })

            router.push("/admin/dashboard")
        } catch (err) {
            console.error("Login error:", err)
            setError("Terjadi kesalahan. Silakan coba lagi.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0a1a] to-[#0a0a0f] flex items-center justify-center p-4">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-christmas-red/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial="initial"
                animate="animate"
                variants={fadeInUp}
                className="w-full max-w-md relative z-10"
            >
                <Card variant="glass" className="border-purple-500/30">
                    <CardContent className="p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
                                <Shield className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
                            <p className="text-gray-400 text-sm">
                                Shopping Journey - Supermal Karawaci
                            </p>
                        </div>

                        {/* Login form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-300">
                                    Password Admin
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Masukkan password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value)
                                            setError("")
                                        }}
                                        className="pl-10 pr-10"
                                        error={!!error}
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                {error && (
                                    <p className="text-xs text-christmas-red flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {error}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                loading={loading}
                                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 shadow-lg shadow-purple-500/25"
                            >
                                {loading ? "Memverifikasi..." : "Masuk"}
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </form>

                        {/* Footer note */}
                        <p className="text-xs text-gray-600 text-center mt-6">
                            Akses terbatas untuk panitia event
                        </p>
                    </CardContent>
                </Card>

                {/* Back to main site */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => router.push("/")}
                        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        ← Kembali ke halaman utama
                    </button>
                </div>
            </motion.div>
        </div>
    )
}