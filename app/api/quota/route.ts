// app/api/quota/route.ts
// Created: API endpoint for quota status

import { NextRequest, NextResponse } from "next/server"
import { getQuotaStatus } from "@/lib/supabase"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
    try {
        const quota = await getQuotaStatus()

        if (!quota) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Gagal mendapatkan status kuota",
                },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            data: quota,
        })
    } catch (error) {
        console.error("Quota API error:", error)
        return NextResponse.json(
            {
                success: false,
                error: "Terjadi kesalahan server",
            },
            { status: 500 }
        )
    }
}