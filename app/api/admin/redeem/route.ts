// app/api/admin/redeem/route.ts
// Created: API endpoint for voucher redemption

import { NextRequest, NextResponse } from "next/server"
import {
    getParticipantById,
    getParticipantByRedemptionCode,
    markAsRedeemed,
} from "@/lib/supabase"
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { participantId, redemptionCode } = body

        // Require either participantId or redemptionCode
        if (!participantId && !redemptionCode) {
            return NextResponse.json(
                {
                    success: false,
                    error: "ID peserta atau kode voucher diperlukan",
                },
                { status: 400 }
            )
        }

        let participant = null

        // Lookup participant
        if (participantId) {
            participant = await getParticipantById(participantId)
        } else if (redemptionCode) {
            participant = await getParticipantByRedemptionCode(redemptionCode)
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

        // Check if already redeemed
        if (participant.redemption_status === "redeemed") {
            return NextResponse.json(
                {
                    success: false,
                    error: "Voucher sudah ditukar sebelumnya",
                    data: {
                        redeemedAt: participant.redemption_timestamp,
                    },
                },
                { status: 409 }
            )
        }

        // Check if all missions are complete
        const allComplete =
            participant.mission1_status === "completed" &&
            participant.mission2_status === "completed"

        if (!allComplete) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Peserta belum menyelesaikan semua misi",
                    data: {
                        mission1: participant.mission1_status,
                        mission2: participant.mission2_status,
                    },
                },
                { status: 403 }
            )
        }

        // Mark as redeemed
        const result = await markAsRedeemed(participant.id)

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
            message: SUCCESS_MESSAGES.redeemSuccess,
            data: {
                participantId: participant.id,
                fullName: participant.full_name,
                phoneNumber: participant.phone_number,
                redemptionCode: participant.redemption_code,
                redeemedAt: new Date().toISOString(),
            },
        })
    } catch (error) {
        console.error("Admin redeem API error:", error)
        return NextResponse.json(
            {
                success: false,
                error: ERROR_MESSAGES.serverError,
            },
            { status: 500 }
        )
    }
}

// GET: Lookup participant by redemption code
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const code = searchParams.get("code")

        if (!code) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Kode voucher diperlukan",
                },
                { status: 400 }
            )
        }

        const participant = await getParticipantByRedemptionCode(code)

        if (!participant) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Kode voucher tidak ditemukan",
                },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                id: participant.id,
                fullName: participant.full_name,
                phoneNumber: participant.phone_number,
                redemptionCode: participant.redemption_code,
                mission1Status: participant.mission1_status,
                mission2Status: participant.mission2_status,
                redemptionStatus: participant.redemption_status,
                redemptionTimestamp: participant.redemption_timestamp,
            },
        })
    } catch (error) {
        console.error("Admin redeem lookup API error:", error)
        return NextResponse.json(
            {
                success: false,
                error: ERROR_MESSAGES.serverError,
            },
            { status: 500 }
        )
    }
}