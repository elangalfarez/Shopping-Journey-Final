// app/mission/[id]/loading.tsx
// Created: Loading skeleton for mission page

import { Receipt } from "lucide-react"

export default function MissionLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0f0f] to-[#0a0a0f]">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-christmas-red/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-christmas-gold/5 rounded-full blur-[100px]" />
            </div>

            {/* Header skeleton */}
            <div className="bg-gradient-to-r from-[#0f1419] via-[#1a1f2e] to-[#0f1419] border-b border-christmas-red/20 p-4">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                    <div className="w-20 h-8 bg-gray-800/50 rounded animate-pulse" />
                    <div className="w-24 h-6 bg-gray-800/50 rounded animate-pulse" />
                    <div className="w-20" />
                </div>
            </div>

            {/* Content skeleton */}
            <div className="relative z-10 p-4 max-w-lg mx-auto space-y-4">
                {/* Mission info card skeleton */}
                <div className="bg-gradient-to-br from-christmas-red/20 to-red-900/10 backdrop-blur-xl rounded-2xl border-2 border-christmas-red/30 p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-700/50 rounded-2xl animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="w-40 h-6 bg-gray-700/50 rounded animate-pulse" />
                            <div className="w-56 h-4 bg-gray-700/50 rounded animate-pulse" />
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="bg-gray-800/50 rounded-xl p-3">
                            <div className="w-20 h-3 bg-gray-700/50 rounded animate-pulse mb-2" />
                            <div className="w-24 h-5 bg-gray-700/50 rounded animate-pulse" />
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-3">
                            <div className="w-16 h-3 bg-gray-700/50 rounded animate-pulse mb-2" />
                            <div className="w-20 h-5 bg-gray-700/50 rounded animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Upload area skeleton */}
                <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/30 p-6">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gray-700/50 rounded-full animate-pulse mx-auto mb-4 flex items-center justify-center">
                            <Receipt className="w-8 h-8 text-gray-600" />
                        </div>
                        <div className="w-48 h-6 bg-gray-700/50 rounded animate-pulse mx-auto mb-2" />
                        <div className="w-64 h-4 bg-gray-700/50 rounded animate-pulse mx-auto" />
                    </div>

                    {/* Button skeletons */}
                    <div className="space-y-3">
                        <div className="w-full h-12 bg-gray-700/50 rounded-xl animate-pulse" />
                        <div className="w-full h-12 bg-gray-700/50 rounded-xl animate-pulse" />
                    </div>

                    {/* Requirements skeleton */}
                    <div className="mt-6 p-4 bg-gray-800/30 rounded-xl">
                        <div className="w-24 h-3 bg-gray-700/50 rounded animate-pulse mb-3" />
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-gray-700/50 rounded animate-pulse" />
                                    <div className="w-48 h-3 bg-gray-700/50 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}