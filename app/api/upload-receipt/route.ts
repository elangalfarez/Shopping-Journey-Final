// app/api/upload-receipt/route.ts
// Created: API endpoint for receipt file uploads

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { ERROR_MESSAGES, VALIDATION } from "@/lib/constants"

// Create Supabase client with service role for storage operations
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get("file") as File | null
        const participantId = formData.get("participantId") as string | null
        const missionId = formData.get("missionId") as string | null

        // Validate required fields
        if (!file) {
            return NextResponse.json(
                {
                    success: false,
                    error: "File struk diperlukan",
                    field: "file",
                },
                { status: 400 }
            )
        }

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

        if (!missionId || !["1", "2"].includes(missionId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "ID misi tidak valid",
                    field: "missionId",
                },
                { status: 400 }
            )
        }

        // Validate file type
        const allowedTypes = VALIDATION.receipt.allowedTypes
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Format file tidak didukung. Gunakan: ${allowedTypes.join(", ")}`,
                    field: "file",
                },
                { status: 400 }
            )
        }

        // Validate file size
        const maxSize = VALIDATION.receipt.maxSize
        if (file.size > maxSize) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Ukuran file terlalu besar. Maksimal ${maxSize / 1024 / 1024}MB`,
                    field: "file",
                },
                { status: 400 }
            )
        }

        // Generate unique filename
        const extension = file.name.split(".").pop() || "jpg"
        const timestamp = Date.now()
        const filename = `${participantId}/mission${missionId}_${timestamp}.${extension}`

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from("receipts")
            .upload(filename, buffer, {
                contentType: file.type,
                upsert: true,
            })

        if (error) {
            console.error("Storage upload error:", error)
            return NextResponse.json(
                {
                    success: false,
                    error: "Gagal mengupload file",
                },
                { status: 500 }
            )
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from("receipts")
            .getPublicUrl(filename)

        return NextResponse.json({
            success: true,
            data: {
                path: data.path,
                url: urlData.publicUrl,
                filename,
            },
        })
    } catch (error) {
        console.error("Upload receipt API error:", error)
        return NextResponse.json(
            {
                success: false,
                error: ERROR_MESSAGES.serverError,
            },
            { status: 500 }
        )
    }
}

// Configure body parser for larger files
export const config = {
    api: {
        bodyParser: false,
    },
}