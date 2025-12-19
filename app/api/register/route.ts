// app/api/register/route.ts
// Created: API endpoint for participant registration

import { NextRequest, NextResponse } from "next/server"
import {
    isPhoneRegistered,
    registerParticipant,
    getQuotaStatus,
} from "@/lib/supabase"
import { registrationSchema } from "@/lib/validations"
import { normalizePhone } from "@/lib/utils"
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validation = registrationSchema.safeParse(body)
        if (!validation.success) {
            const firstError = validation.error.errors[0]
            return NextResponse.json(
                {
                    success: false,
                    error: firstError?.message || ERROR_MESSAGES.validation,
                    field: firstError?.path[0],
                },
                { status: 400 }
            )
        }

        const { phone, name } = validation.data

        // Normalize phone number
        const normalizedPhone = normalizePhone(phone)

        // Check if phone already registered
        const isRegistered = await isPhoneRegistered(normalizedPhone)
        if (isRegistered) {
            return NextResponse.json(
                {
                    success: false,
                    error: ERROR_MESSAGES.phoneRegistered,
                    field: "phone",
                },
                { status: 409 }
            )
        }

        // Check quota availability
        const quota = await getQuotaStatus()
        if (!quota || quota.remaining <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: ERROR_MESSAGES.quotaFull,
                },
                { status: 403 }
            )
        }

        // Register participant (redemption_code is generated internally when both missions complete)
        const result = await registerParticipant({
            phone_number: normalizedPhone,
            full_name: name,
        })

        if (!result.success || !result.participant) {
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
            message: SUCCESS_MESSAGES.registrationSuccess,
            data: {
                id: result.participant.id,
                phone_number: result.participant.phone_number,
                full_name: result.participant.full_name,
                redemption_code: result.participant.redemption_code,
            },
        })
    } catch (error) {
        console.error("Registration API error:", error)
        return NextResponse.json(
            {
                success: false,
                error: ERROR_MESSAGES.serverError,
            },
            { status: 500 }
        )
    }
}