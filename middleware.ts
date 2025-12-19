// middleware.ts
// Created: Route protection and security headers

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
    const response = NextResponse.next()

    // Add security headers
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set(
        "Permissions-Policy",
        "camera=(self), microphone=(), geolocation=()"
    )

    // CSP for production
    if (process.env.NODE_ENV === "production") {
        response.headers.set(
            "Content-Security-Policy",
            [
                "default-src 'self'",
                "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: blob: https:",
                "font-src 'self' data:",
                "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
                "frame-ancestors 'none'",
                "worker-src 'self' blob:",
            ].join("; ")
        )
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}