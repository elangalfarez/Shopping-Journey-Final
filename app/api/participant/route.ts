// app/api/participant/route.ts
// Created: API endpoint for participant lookup

import { NextRequest, NextResponse } from "next/server"
import {
    getParticipantByPhone,
    getParticipantById,
} from "@/lib/supabase"
import { normalizePhone } from "@/lib/utils"
import { ERROR_MESSAGES } from "@/lib/constants"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const phone = searchParams.get("phone")
        const id = searchParams.get("id")

        if (!phone && !id) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Parameter 'phone' atau 'id' diperlukan",
                },
                { status: 400 }
            )
        }

        let participant = null

        if (id) {
            // Lookup by ID
            participant = await getParticipantById(id)
        } else if (phone) {
            // Normalize phone and lookup
            const normalizedPhone = normalizePhone(phone)
            participant = await getParticipantByPhone(normalizedPhone)
        }

        if (!participant) {
            return NextResponse.json(
                {
                    success: false,
                    error: ERROR_MESSAGES.notFound,
                },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: participant,
        })
    } catch (error) {
        console.error("Participant API error:", error)
        return NextResponse.json(
            {
                success: false,
                error: ERROR_MESSAGES.serverError,
            },
            { status: 500 }
        )
    }
}