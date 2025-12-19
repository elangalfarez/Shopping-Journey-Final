// app/api/mission/route.ts
// Created: API endpoint for updating mission status

import { NextRequest, NextResponse } from "next/server"
import { updateMission, getParticipantById } from "@/lib/supabase"
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { participantId, missionId, status, receiptUrl, amount } = body

        // Validate required fields
        if (!participantId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "ID peserta diperlukan",
                    field: "participantId",
                },
                { status: 400 }
            )
        }

        if (!missionId || ![1, 2].includes(missionId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "ID misi tidak valid (harus 1 atau 2)",
                    field: "missionId",
                },
                { status: 400 }
            )
        }

        if (!status || !["pending", "completed"].includes(status)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Status tidak valid",
                    field: "status",
                },
                { status: 400 }
            )
        }

        // Verify participant exists
        const participant = await getParticipantById(participantId)
        if (!participant) {
            return NextResponse.json(
                {
                    success: false,
                    error: ERROR_MESSAGES.notFound,
                },
                { status: 404 }
            )
        }

        // Check if mission already completed
        const missionStatus = missionId === 1
            ? participant.mission1_status
            : participant.mission2_status

        if (missionStatus === "completed") {
            return NextResponse.json(
                {
                    success: false,
                    error: "Misi sudah diselesaikan sebelumnya",
                },
                { status: 409 }
            )
        }

        // Update mission
        const result = await updateMission(participantId, missionId as 1 | 2, {
            status,
            receiptUrl,
            amount,
        })

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: result.error || ERROR_MESSAGES.serverError,
                },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: SUCCESS_MESSAGES.missionComplete,
            data: result.participant,
        })
    } catch (error) {
        console.error("Mission API error:", error)
        return NextResponse.json(
            {
                success: false,
                error: ERROR_MESSAGES.serverError,
            },
            { status: 500 }
        )
    }
}