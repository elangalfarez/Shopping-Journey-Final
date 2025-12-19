// app/admin/layout.tsx
// Created: Admin section layout with metadata

import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Admin Panel - Shopping Journey",
    description: "Admin dashboard untuk Shopping Journey Supermal Karawaci",
    robots: {
        index: false,
        follow: false,
    },
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}