// app/api/admin/participants/route.ts
// Created: API endpoint for admin participants list

import { NextRequest, NextResponse } from "next/server"
import { getParticipants } from "@/lib/supabase"
import { ERROR_MESSAGES } from "@/lib/constants"
import type { AdminSearchParams } from "@/lib/types"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        // Parse query parameters
        const params: AdminSearchParams = {
            query: searchParams.get("query") || undefined,
            status: (searchParams.get("status") as AdminSearchParams["status"]) || undefined,
            page: parseInt(searchParams.get("page") || "1", 10),
            limit: parseInt(searchParams.get("limit") || "20", 10),
            sortBy: (searchParams.get("sortBy") as AdminSearchParams["sortBy"]) || "created_at",
            sortOrder: (searchParams.get("sortOrder") as AdminSearchParams["sortOrder"]) || "desc",
        }

        // Validate limit
        if (params.limit && (params.limit < 1 || params.limit > 100)) {
            params.limit = 20
        }

        const result = await getParticipants(params)

        return NextResponse.json({
            success: true,
            data: result.data,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
                hasMore: result.hasMore,
            },
        })
    } catch (error) {
        console.error("Admin participants API error:", error)
        return NextResponse.json(
            {
                success: false,
                error: ERROR_MESSAGES.serverError,
            },
            { status: 500 }
        )
    }
}