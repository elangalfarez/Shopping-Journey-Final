// next.config.ts
// Created: Next.js configuration for Shopping Journey

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Base path for deployment to supermalkarawaci.co.id/shopping-journey
    basePath: "/shopping-journey",
    assetPrefix: "/shopping-journey/",

    // Image optimization
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
        ],
        // Disable image optimization for receipts (user uploads)
        unoptimized: true,
    },

    // Strict mode for better development experience
    reactStrictMode: true,

    // Experimental features
    experimental: {
        // Enable server actions
        serverActions: {
            bodySizeLimit: "10mb", // For receipt uploads
        },
    },

    // Headers for security
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "X-Frame-Options",
                        value: "DENY",
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                ],
            },
        ];
    },

    // Redirects
    async redirects() {
        return [
            // Redirect /admin to /admin/dashboard if authenticated
            {
                source: "/admin",
                destination: "/admin/login",
                permanent: false,
            },
        ];
    },
};

export default nextConfig;