// app/api/health/route.ts
// Created: Health check API endpoint for monitoring

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
    const startTime = Date.now()

    try {
        // Check Supabase connection
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { error } = await supabase
            .from("quota_tracker")
            .select("id")
            .limit(1)
            .single()

        const dbStatus = error ? "error" : "healthy"
        const responseTime = Date.now() - startTime

        const status = dbStatus === "healthy" ? "healthy" : "degraded"

        return NextResponse.json(
            {
                status,
                timestamp: new Date().toISOString(),
                responseTime: `${responseTime}ms`,
                services: {
                    api: "healthy",
                    database: dbStatus,
                },
                environment: process.env.NODE_ENV,
                version: "1.0.0",
            },
            {
                status: status === "healthy" ? 200 : 503,
            }
        )
    } catch (error) {
        console.error("Health check error:", error)

        return NextResponse.json(
            {
                status: "unhealthy",
                timestamp: new Date().toISOString(),
                responseTime: `${Date.now() - startTime}ms`,
                services: {
                    api: "healthy",
                    database: "error",
                },
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 503 }
        )
    }
}