// app/admin/login/loading.tsx
// Created: Loading skeleton for admin login page

import { Shield } from "lucide-react"

export default function AdminLoginLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0a1a] to-[#0a0a0f] flex items-center justify-center p-4">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-christmas-red/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/30 p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <Shield className="w-10 h-10 text-purple-400/50" />
                        </div>
                        <div className="w-32 h-7 bg-gray-700/50 rounded animate-pulse mx-auto mb-2" />
                        <div className="w-48 h-4 bg-gray-700/50 rounded animate-pulse mx-auto" />
                    </div>

                    {/* Form skeleton */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="w-24 h-4 bg-gray-700/50 rounded animate-pulse" />
                            <div className="w-full h-12 bg-gray-700/50 rounded-xl animate-pulse" />
                        </div>
                        <div className="w-full h-11 bg-purple-500/20 rounded-xl animate-pulse" />
                    </div>

                    {/* Footer */}
                    <div className="w-40 h-3 bg-gray-700/50 rounded animate-pulse mx-auto mt-6" />
                </div>
            </div>
        </div>
    )
}