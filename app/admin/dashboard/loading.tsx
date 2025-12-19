// app/admin/dashboard/loading.tsx
// Created: Loading skeleton for admin dashboard

import { Shield } from "lucide-react"

export default function AdminDashboardLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0a1a] to-[#0a0a0f]">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-christmas-gold/5 rounded-full blur-[100px]" />
            </div>

            {/* Header skeleton */}
            <header className="relative z-10 bg-gradient-to-r from-[#0f1419] via-[#1a1020] to-[#0f1419] border-b border-purple-500/20 p-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-xl">
                            <Shield className="w-6 h-6 text-purple-400/50" />
                        </div>
                        <div className="space-y-1">
                            <div className="w-32 h-5 bg-gray-700/50 rounded animate-pulse" />
                            <div className="w-24 h-3 bg-gray-700/50 rounded animate-pulse" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-gray-700/50 rounded-xl animate-pulse" />
                        <div className="w-9 h-9 bg-gray-700/50 rounded-xl animate-pulse" />
                    </div>
                </div>
            </header>

            {/* Content skeleton */}
            <main className="relative z-10 p-4 max-w-6xl mx-auto space-y-6">
                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/30 p-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-700/50 rounded-xl animate-pulse" />
                                <div className="flex-1 space-y-2">
                                    <div className="w-16 h-3 bg-gray-700/50 rounded animate-pulse" />
                                    <div className="w-12 h-7 bg-gray-700/50 rounded animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Code lookup skeleton */}
                <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 bg-gray-700/50 rounded animate-pulse" />
                        <div className="w-32 h-5 bg-gray-700/50 rounded animate-pulse" />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1 h-12 bg-gray-700/50 rounded-xl animate-pulse" />
                        <div className="w-12 h-12 bg-gray-700/50 rounded-xl animate-pulse" />
                    </div>
                </div>

                {/* Participants list skeleton */}
                <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/30 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-32 h-5 bg-gray-700/50 rounded animate-pulse" />
                        <div className="w-20 h-6 bg-gray-700/50 rounded-full animate-pulse" />
                    </div>

                    <div className="flex gap-2 mb-4">
                        <div className="flex-1 h-12 bg-gray-700/50 rounded-xl animate-pulse" />
                        <div className="w-28 h-12 bg-gray-700/50 rounded-xl animate-pulse" />
                    </div>

                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <div className="w-32 h-5 bg-gray-700/50 rounded animate-pulse" />
                                        <div className="w-24 h-3 bg-gray-700/50 rounded animate-pulse" />
                                        <div className="flex gap-2">
                                            <div className="w-12 h-5 bg-gray-700/50 rounded animate-pulse" />
                                            <div className="w-16 h-5 bg-gray-700/50 rounded animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-9 h-9 bg-gray-700/50 rounded-lg animate-pulse" />
                                        <div className="w-20 h-9 bg-gray-700/50 rounded-lg animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}