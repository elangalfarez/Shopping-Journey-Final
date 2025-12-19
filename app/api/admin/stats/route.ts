// app/api/admin/stats/route.ts
// Created: API endpoint for admin dashboard statistics

import { NextRequest, NextResponse } from "next/server"
import { getAdminStats } from "@/lib/supabase"
import { ERROR_MESSAGES } from "@/lib/constants"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
    try {
        // Note: In production, add proper admin authentication check here
        // const authHeader = request.headers.get("authorization")
        // if (!validateAdminToken(authHeader)) {
        //   return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
        // }

        const stats = await getAdminStats()

        if (!stats) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Gagal mendapatkan statistik",
                },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            data: stats,
        })
    } catch (error) {
        console.error("Admin stats API error:", error)
        return NextResponse.json(
            {
                success: false,
                error: ERROR_MESSAGES.serverError,
            },
            { status: 500 }
        )
    }
}