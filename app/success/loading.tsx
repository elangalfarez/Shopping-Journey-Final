// app/success/loading.tsx
// Created: Loading skeleton for success page

import { Gift } from "lucide-react"

export default function SuccessLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f1a0f] to-[#0a0a0f]">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-christmas-gold/15 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-christmas-green/10 rounded-full blur-[100px]" />
            </div>

            {/* Header skeleton */}
            <div className="bg-gradient-to-r from-[#0f1419] via-[#1a1f2e] to-[#0f1419] border-b border-christmas-gold/20 p-4">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                    <div className="w-20 h-8 bg-gray-800/50 rounded animate-pulse" />
                    <div className="w-28 h-6 bg-gray-800/50 rounded animate-pulse" />
                    <div className="w-20" />
                </div>
            </div>

            {/* Content skeleton */}
            <div className="relative z-10 p-4 max-w-lg mx-auto space-y-6">
                {/* Badge skeleton */}
                <div className="flex justify-center">
                    <div className="w-40 h-8 bg-gray-800/50 rounded-full animate-pulse" />
                </div>

                {/* QR Card skeleton */}
                <div className="bg-gradient-to-br from-christmas-gold/20 to-amber-900/10 backdrop-blur-xl rounded-2xl border-2 border-christmas-gold/30 p-6">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Gift className="w-6 h-6 text-christmas-gold/50" />
                            <div className="w-28 h-6 bg-gray-700/50 rounded animate-pulse" />
                        </div>
                        <div className="w-32 h-10 bg-gray-700/50 rounded animate-pulse mx-auto" />
                    </div>

                    {/* QR placeholder */}
                    <div className="bg-white rounded-2xl p-4 mb-6">
                        <div className="w-[200px] h-[200px] bg-gray-200 rounded mx-auto animate-pulse" />
                    </div>

                    {/* Code skeleton */}
                    <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
                        <div className="w-20 h-3 bg-gray-700/50 rounded animate-pulse mx-auto mb-2" />
                        <div className="w-40 h-7 bg-gray-700/50 rounded animate-pulse mx-auto" />
                    </div>

                    {/* Name skeleton */}
                    <div className="text-center space-y-1">
                        <div className="w-12 h-3 bg-gray-700/50 rounded animate-pulse mx-auto" />
                        <div className="w-32 h-5 bg-gray-700/50 rounded animate-pulse mx-auto" />
                    </div>
                </div>

                {/* Action buttons skeleton */}
                <div className="flex gap-3">
                    <div className="flex-1 h-11 bg-gray-800/50 rounded-xl animate-pulse" />
                    <div className="flex-1 h-11 bg-gray-800/50 rounded-xl animate-pulse" />
                </div>

                {/* Instructions skeleton */}
                <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/30 p-5">
                    <div className="w-32 h-5 bg-gray-700/50 rounded animate-pulse mb-4" />
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-3">
                                <div className="w-8 h-8 bg-gray-700/50 rounded-full animate-pulse" />
                                <div className="flex-1 space-y-1">
                                    <div className="w-16 h-4 bg-gray-700/50 rounded animate-pulse" />
                                    <div className="w-full h-3 bg-gray-700/50 rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}