// app/terms/loading.tsx
// Created: Loading state for terms page

import { FileText } from "lucide-react"

export default function TermsLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0f0f] to-[#0a0a0f]">
            {/* Header skeleton */}
            <div className="bg-gradient-to-r from-[#0f1419] via-[#1a1f2e] to-[#0f1419] border-b border-christmas-red/20 p-4">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                    <div className="w-20 h-8 bg-gray-800/50 rounded animate-pulse" />
                    <div className="w-32 h-6 bg-gray-800/50 rounded animate-pulse" />
                    <div className="w-20" />
                </div>
            </div>

            {/* Content skeleton */}
            <div className="p-4 max-w-2xl mx-auto">
                {/* Header card skeleton */}
                <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-christmas-red/20 p-6 mb-6">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-700/50 rounded-full animate-pulse mb-4" />
                        <div className="w-40 h-6 bg-gray-700/50 rounded animate-pulse mb-2" />
                        <div className="w-56 h-4 bg-gray-700/50 rounded animate-pulse" />
                    </div>
                </div>

                {/* Terms list skeleton */}
                <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/30 p-6">
                    <div className="w-48 h-6 bg-gray-700/50 rounded animate-pulse mb-6" />

                    <div className="space-y-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex gap-3">
                                <div className="w-6 h-6 bg-gray-700/50 rounded-full animate-pulse flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-700/50 rounded animate-pulse" />
                                    <div className="h-4 bg-gray-700/50 rounded animate-pulse w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}