// app/layout.tsx
// Created: Root layout for Shopping Journey with Christmas theme

import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Shopping Journey - Supermal Karawaci",
  description: "Selesaikan misi belanja dan menangkan voucher Rp 100.000! Christmas Super Midnight Sale 2025 - 20 Desember 2025",
  manifest: "/manifest.json",
  applicationName: "Shopping Journey",
  authors: [{ name: "Supermal Karawaci" }],
  keywords: ["shopping", "voucher", "supermal karawaci", "christmas sale", "midnight sale"],
  creator: "Supermal Karawaci",
  publisher: "Supermal Karawaci",

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Shopping Journey",
  },

  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" }
    ],
  },

  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://shopping-journey.supermalkarawaci.com",
    siteName: "Shopping Journey - Supermal Karawaci",
    title: "Shopping Journey - Christmas Super Midnight Sale",
    description: "Selesaikan 2 misi belanja dan menangkan voucher Rp 100.000! Hanya untuk 100 pemenang pertama.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Shopping Journey - Supermal Karawaci Christmas Sale",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Shopping Journey - Christmas Super Midnight Sale",
    description: "Selesaikan misi belanja dan menangkan voucher Rp 100.000!",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#dc2626",
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="dark">
      <head>
        {/* PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />

        {/* Preconnect to Supabase for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body
        className={`${inter.variable} font-sans bg-primary text-text-light antialiased min-h-screen`}
        suppressHydrationWarning
      >
        {/* Main content */}
        <main className="relative min-h-screen">
          {children}
        </main>

        {/* Toast notifications */}
        <Toaster />

        {/* Christmas ambient background effect */}
        <div
          className="fixed inset-0 pointer-events-none z-[-1] opacity-30"
          style={{
            background: `
              radial-gradient(ellipse at 20% 20%, rgba(220, 38, 38, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, rgba(22, 163, 74, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(245, 158, 11, 0.05) 0%, transparent 70%)
            `
          }}
          aria-hidden="true"
        />
      </body>
    </html>
  )
}