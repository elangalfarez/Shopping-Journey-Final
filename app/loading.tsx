// app/loading.tsx
// Created: Loading state for home page

import { TreePine } from "lucide-react"

export default function HomeLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0f0f] to-[#0a0a0f] flex items-center justify-center">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-christmas-red/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-christmas-green/10 rounded-full blur-[100px]" />
            </div>

            {/* Loading content */}
            <div className="relative z-10 text-center">
                <div className="relative">
                    {/* Spinning ring */}
                    <div className="w-20 h-20 border-4 border-christmas-red/30 border-t-christmas-red rounded-full animate-spin mx-auto" />

                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <TreePine className="w-8 h-8 text-christmas-red animate-pulse" />
                    </div>
                </div>

                <p className="text-white font-medium mt-6">Memuat...</p>
                <p className="text-gray-400 text-sm mt-1">Shopping Journey</p>
            </div>
        </div>
    )
}