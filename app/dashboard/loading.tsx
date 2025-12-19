// app/dashboard/loading.tsx
// Created: Loading skeleton for dashboard page

export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0f0f] to-[#0a0a0f]">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-christmas-red/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-christmas-green/10 rounded-full blur-[100px]" />
            </div>

            {/* Header skeleton */}
            <div className="bg-gradient-to-r from-[#0f1419] via-[#1a1f2e] to-[#0f1419] border-b border-christmas-red/20 p-4">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                    <div className="space-y-1">
                        <div className="w-32 h-5 bg-gray-800/50 rounded animate-pulse" />
                        <div className="w-24 h-4 bg-gray-800/50 rounded animate-pulse" />
                    </div>
                    <div className="w-20 h-8 bg-gray-800/50 rounded-full animate-pulse" />
                </div>
            </div>

            {/* Content skeleton */}
            <div className="relative z-10 p-4 max-w-lg mx-auto space-y-6">
                {/* Welcome card skeleton */}
                <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/30 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="space-y-2">
                            <div className="w-40 h-6 bg-gray-700/50 rounded animate-pulse" />
                            <div className="w-32 h-4 bg-gray-700/50 rounded animate-pulse" />
                        </div>
                        <div className="text-right space-y-1">
                            <div className="w-12 h-8 bg-gray-700/50 rounded animate-pulse ml-auto" />
                            <div className="w-16 h-3 bg-gray-700/50 rounded animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <div className="w-16 h-3 bg-gray-700/50 rounded animate-pulse" />
                            <div className="w-8 h-3 bg-gray-700/50 rounded animate-pulse" />
                        </div>
                        <div className="h-3 bg-gray-700/50 rounded-full animate-pulse" />
                    </div>
                </div>

                {/* Section title skeleton */}
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-700/50 rounded animate-pulse" />
                    <div className="w-28 h-6 bg-gray-700/50 rounded animate-pulse" />
                </div>

                {/* Mission card skeletons */}
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/30 p-5"
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-14 h-14 bg-gray-700/50 rounded-2xl animate-pulse" />
                            <div className="flex-1 space-y-2">
                                <div className="w-16 h-3 bg-gray-700/50 rounded animate-pulse" />
                                <div className="w-32 h-6 bg-gray-700/50 rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                                <div className="w-24 h-4 bg-gray-700/50 rounded animate-pulse" />
                                <div className="w-20 h-4 bg-gray-700/50 rounded animate-pulse" />
                            </div>
                            <div className="flex justify-between">
                                <div className="w-28 h-4 bg-gray-700/50 rounded animate-pulse" />
                                <div className="w-16 h-4 bg-gray-700/50 rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="w-full h-11 bg-gray-700/50 rounded-xl animate-pulse" />
                    </div>
                ))}

                {/* Voucher info skeleton */}
                <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-dashed border-gray-700/30 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700/50 rounded-xl animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="w-24 h-4 bg-gray-700/50 rounded animate-pulse" />
                            <div className="w-48 h-3 bg-gray-700/50 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}