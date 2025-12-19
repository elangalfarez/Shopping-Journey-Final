// app/api/admin/login/route.ts
// Created: Admin login API endpoint

import { NextRequest, NextResponse } from "next/server"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "supermal2025"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { password } = body

        if (!password) {
            return NextResponse.json(
                { success: false, error: "Password wajib diisi" },
                { status: 400 }
            )
        }

        // Validate password
        if (password !== ADMIN_PASSWORD) {
            return NextResponse.json(
                { success: false, error: "Password salah" },
                { status: 401 }
            )
        }

        // Generate simple session token
        const token = Buffer.from(`admin:${Date.now()}`).toString("base64")

        return NextResponse.json({
            success: true,
            token,
            message: "Login berhasil",
        })
    } catch (error) {
        console.error("Admin login error:", error)
        return NextResponse.json(
            { success: false, error: "Terjadi kesalahan server" },
            { status: 500 }
        )
    }
}