// app/admin/dashboard/page.tsx
// Created: Admin dashboard with participant management and redemption

"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    Users,
    Gift,
    CheckCircle,
    Search,
    RefreshCw,
    LogOut,
    QrCode,
    User,
    Phone,
    Clock,
    ChevronRight,
    Filter,
    X,
    Check,
    AlertCircle,
    Loader2,
    Shield,
    TrendingUp,
    Award,
    Ticket,
    Eye,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

import {
    getAdminStats,
    getParticipants,
    getParticipantByRedemptionCode,
    markAsRedeemed,
} from "@/lib/supabase"
import { getLocalStorage, removeLocalStorage, formatRupiah, formatDateTime } from "@/lib/utils"
import { STORAGE_KEYS, EVENT_CONFIG } from "@/lib/constants"
import type { Participant, AdminStats, PaginatedResponse } from "@/lib/types"

// ===========================================
// ANIMATION VARIANTS
// ===========================================

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
}

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.05,
        },
    },
}

// ===========================================
// STAT CARD COMPONENT
// ===========================================

interface StatCardProps {
    title: string
    value: number | string
    icon: React.ReactNode
    color: "purple" | "green" | "gold" | "red"
    subtitle?: string
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
    const colors = {
        purple: "from-purple-500/20 to-purple-900/10 border-purple-500/30 text-purple-400",
        green: "from-christmas-green/20 to-green-900/10 border-christmas-green/30 text-christmas-green",
        gold: "from-christmas-gold/20 to-amber-900/10 border-christmas-gold/30 text-christmas-gold",
        red: "from-christmas-red/20 to-red-900/10 border-christmas-red/30 text-christmas-red",
    }

    const iconBg = {
        purple: "bg-purple-500/30",
        green: "bg-christmas-green/30",
        gold: "bg-christmas-gold/30",
        red: "bg-christmas-red/30",
    }

    return (
        <Card className={`bg-gradient-to-br ${colors[color]} border-2`}>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${iconBg[color]}`}>
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 truncate">{title}</p>
                        <p className="text-2xl font-bold text-white">{value}</p>
                        {subtitle && (
                            <p className="text-xs text-gray-500">{subtitle}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// ===========================================
// PARTICIPANT ROW COMPONENT
// ===========================================

interface ParticipantRowProps {
    participant: Participant
    onRedeem: (participant: Participant) => void
    onView: (participant: Participant) => void
}

function ParticipantRow({ participant, onRedeem, onView }: ParticipantRowProps) {
    const mission1Complete = participant.mission1_status === "completed"
    const mission2Complete = participant.mission2_status === "completed"
    const allComplete = mission1Complete && mission2Complete
    const isRedeemed = participant.redemption_status === "redeemed"

    return (
        <motion.div
            variants={fadeInUp}
            className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30 hover:border-gray-600/50 transition-colors"
        >
            <div className="flex items-center justify-between gap-4">
                {/* Participant info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-white truncate">{participant.full_name}</p>
                        {isRedeemed && (
                            <Badge variant="success" className="text-[10px]">
                                <Check className="w-2.5 h-2.5 mr-0.5" />
                                Redeemed
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-gray-400">{participant.phone_number}</p>

                    {/* Mission status */}
                    <div className="flex items-center gap-2 mt-2">
                        <div
                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${mission1Complete
                                    ? "bg-christmas-red/20 text-christmas-red"
                                    : "bg-gray-700/50 text-gray-500"
                                }`}
                        >
                            F&B {mission1Complete ? "✓" : "—"}
                        </div>
                        <div
                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${mission2Complete
                                    ? "bg-christmas-green/20 text-christmas-green"
                                    : "bg-gray-700/50 text-gray-500"
                                }`}
                        >
                            Fashion {mission2Complete ? "✓" : "—"}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => onView(participant)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>

                    {allComplete && !isRedeemed && (
                        <Button
                            onClick={() => onRedeem(participant)}
                            variant="gold"
                            size="sm"
                        >
                            <Gift className="w-4 h-4 mr-1" />
                            Redeem
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

// ===========================================
// PARTICIPANT DETAIL DIALOG
// ===========================================

interface ParticipantDetailProps {
    participant: Participant | null
    open: boolean
    onClose: () => void
    onRedeem: (participant: Participant) => void
}

function ParticipantDetail({ participant, open, onClose, onRedeem }: ParticipantDetailProps) {
    if (!participant) return null

    const mission1Complete = participant.mission1_status === "completed"
    const mission2Complete = participant.mission2_status === "completed"
    const allComplete = mission1Complete && mission2Complete
    const isRedeemed = participant.redemption_status === "redeemed"

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Detail Peserta</DialogTitle>
                    <DialogDescription>
                        Informasi lengkap peserta dan status misi
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Basic info */}
                    <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-white">{participant.full_name}</p>
                                <p className="text-sm text-gray-400">{participant.phone_number}</p>
                            </div>
                        </div>
                        <Separator className="bg-gray-700/50" />
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Terdaftar</span>
                            <span className="text-white">
                                {formatDateTime(participant.registration_timestamp)}
                            </span>
                        </div>
                    </div>

                    {/* Mission 1 */}
                    <div
                        className={`rounded-xl p-4 border ${mission1Complete
                                ? "bg-christmas-red/10 border-christmas-red/30"
                                : "bg-gray-800/30 border-gray-700/30"
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-white">Misi 1: F&B</span>
                            {mission1Complete ? (
                                <Badge variant="success">Selesai</Badge>
                            ) : (
                                <Badge variant="outline">Belum</Badge>
                            )}
                        </div>
                        {mission1Complete && (
                            <div className="text-sm text-gray-400 space-y-1">
                                <p>Total: {participant.mission1_amount ? formatRupiah(participant.mission1_amount) : "—"}</p>
                                <p>Waktu: {participant.mission1_timestamp ? formatDateTime(participant.mission1_timestamp) : "—"}</p>
                            </div>
                        )}
                    </div>

                    {/* Mission 2 */}
                    <div
                        className={`rounded-xl p-4 border ${mission2Complete
                                ? "bg-christmas-green/10 border-christmas-green/30"
                                : "bg-gray-800/30 border-gray-700/30"
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-white">Misi 2: Fashion</span>
                            {mission2Complete ? (
                                <Badge variant="success">Selesai</Badge>
                            ) : (
                                <Badge variant="outline">Belum</Badge>
                            )}
                        </div>
                        {mission2Complete && (
                            <div className="text-sm text-gray-400 space-y-1">
                                <p>Total: {participant.mission2_amount ? formatRupiah(participant.mission2_amount) : "—"}</p>
                                <p>Waktu: {participant.mission2_timestamp ? formatDateTime(participant.mission2_timestamp) : "—"}</p>
                            </div>
                        )}
                    </div>

                    {/* Redemption info */}
                    {allComplete && (
                        <div
                            className={`rounded-xl p-4 border ${isRedeemed
                                    ? "bg-christmas-gold/10 border-christmas-gold/30"
                                    : "bg-gray-800/30 border-gray-700/30"
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-white">Voucher</span>
                                {isRedeemed ? (
                                    <Badge variant="success">Sudah Ditukar</Badge>
                                ) : (
                                    <Badge variant="warning">Menunggu</Badge>
                                )}
                            </div>
                            <div className="text-sm text-gray-400 space-y-1">
                                <p>Kode: <span className="font-mono text-christmas-gold">{participant.redemption_code || "—"}</span></p>
                                {isRedeemed && participant.redemption_timestamp && (
                                    <p>Ditukar: {formatDateTime(participant.redemption_timestamp)}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Tutup
                    </Button>
                    {allComplete && !isRedeemed && (
                        <Button variant="gold" onClick={() => onRedeem(participant)}>
                            <Gift className="w-4 h-4 mr-2" />
                            Redeem Voucher
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ===========================================
// REDEEM CONFIRMATION DIALOG
// ===========================================

interface RedeemDialogProps {
    participant: Participant | null
    open: boolean
    onClose: () => void
    onConfirm: () => void
    loading: boolean
}

function RedeemDialog({ participant, open, onClose, onConfirm, loading }: RedeemDialogProps) {
    if (!participant) return null

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-center">Konfirmasi Redeem</DialogTitle>
                </DialogHeader>

                <div className="text-center py-4">
                    <div className="w-20 h-20 bg-christmas-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Gift className="w-10 h-10 text-christmas-gold" />
                    </div>

                    <p className="text-white font-semibold mb-1">{participant.full_name}</p>
                    <p className="text-sm text-gray-400 mb-4">{participant.phone_number}</p>

                    <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
                        <p className="text-xs text-gray-500 mb-1">Kode Voucher</p>
                        <p className="font-mono text-xl font-bold text-christmas-gold">
                            {participant.redemption_code}
                        </p>
                    </div>

                    <p className="text-2xl font-bold text-christmas-gold mb-2">
                        {formatRupiah(EVENT_CONFIG.voucherAmount)}
                    </p>
                    <p className="text-xs text-gray-500">Cash Voucher</p>
                </div>

                <DialogFooter className="flex-col gap-2">
                    <Button
                        onClick={onConfirm}
                        loading={loading}
                        variant="gold"
                        className="w-full"
                    >
                        {loading ? "Memproses..." : "Konfirmasi Redeem"}
                    </Button>
                    <Button variant="ghost" onClick={onClose} className="w-full">
                        Batal
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ===========================================
// CODE LOOKUP SECTION
// ===========================================

interface CodeLookupProps {
    onFound: (participant: Participant) => void
}

function CodeLookup({ onFound }: CodeLookupProps) {
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSearch = async () => {
        if (!code.trim()) {
            setError("Masukkan kode voucher")
            return
        }

        setLoading(true)
        setError("")

        try {
            const participant = await getParticipantByRedemptionCode(code.trim())

            if (!participant) {
                setError("Kode voucher tidak ditemukan")
                setLoading(false)
                return
            }

            onFound(participant)
            setCode("")
        } catch (err) {
            console.error("Lookup error:", err)
            setError("Terjadi kesalahan")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card variant="glass" className="border-purple-500/30">
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                    <QrCode className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-white">Cari Kode Voucher</h3>
                </div>

                <div className="flex gap-2">
                    <Input
                        placeholder="SMK-XXXX-XXXXXXXX"
                        value={code}
                        onChange={(e) => {
                            setCode(e.target.value.toUpperCase())
                            setError("")
                        }}
                        className="font-mono"
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <Button
                        onClick={handleSearch}
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                </div>

                {error && (
                    <p className="text-xs text-christmas-red mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {error}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

// ===========================================
// MAIN ADMIN DASHBOARD COMPONENT
// ===========================================

export default function AdminDashboardPage() {
    const router = useRouter()
    const { toast } = useToast()

    // Auth check
    const [isAuthed, setIsAuthed] = useState(false)

    // Data state
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [participants, setParticipants] = useState<PaginatedResponse<Participant> | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    // Search/filter state
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending" | "redeemed">("all")

    // Dialog state
    const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
    const [showDetail, setShowDetail] = useState(false)
    const [showRedeem, setShowRedeem] = useState(false)
    const [redeemLoading, setRedeemLoading] = useState(false)

    // Check auth on mount
    useEffect(() => {
        const session = getLocalStorage<string>(STORAGE_KEYS.adminSession, "")
        if (!session) {
            router.push("/admin/login")
            return
        }
        setIsAuthed(true)
    }, [router])

    // Fetch data
    const fetchData = useCallback(async (showRefreshing = false) => {
        if (showRefreshing) setRefreshing(true)
        else setLoading(true)

        try {
            const [statsData, participantsData] = await Promise.all([
                getAdminStats(),
                getParticipants({
                    query: searchQuery,
                    status: statusFilter,
                    limit: 50,
                    sortBy: "created_at",
                    sortOrder: "desc",
                }),
            ])

            setStats(statsData)
            setParticipants(participantsData)
        } catch (error) {
            console.error("Fetch error:", error)
            toast({
                title: "Error",
                description: "Gagal memuat data",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [searchQuery, statusFilter, toast])

    // Initial fetch
    useEffect(() => {
        if (isAuthed) {
            fetchData()
        }
    }, [isAuthed, fetchData])

    // Handle logout
    const handleLogout = () => {
        removeLocalStorage(STORAGE_KEYS.adminSession)
        router.push("/admin/login")
    }

    // Handle view participant
    const handleView = (participant: Participant) => {
        setSelectedParticipant(participant)
        setShowDetail(true)
    }

    // Handle redeem click
    const handleRedeemClick = (participant: Participant) => {
        setSelectedParticipant(participant)
        setShowDetail(false)
        setShowRedeem(true)
    }

    // Handle redeem confirm
    const handleRedeemConfirm = async () => {
        if (!selectedParticipant) return

        setRedeemLoading(true)

        try {
            const result = await markAsRedeemed(selectedParticipant.id)

            if (!result.success) {
                throw new Error(result.error || "Gagal redeem")
            }

            toast({
                title: "Berhasil!",
                description: `Voucher untuk ${selectedParticipant.full_name} telah di-redeem`,
                variant: "success",
            })

            setShowRedeem(false)
            setSelectedParticipant(null)
            fetchData(true)
        } catch (error) {
            console.error("Redeem error:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Gagal redeem voucher",
                variant: "destructive",
            })
        } finally {
            setRedeemLoading(false)
        }
    }

    // Handle code lookup found
    const handleCodeFound = (participant: Participant) => {
        if (participant.redemption_status === "redeemed") {
            toast({
                title: "Sudah Ditukar",
                description: `Voucher ${participant.full_name} sudah di-redeem sebelumnya`,
                variant: "destructive",
            })
            return
        }

        const allComplete =
            participant.mission1_status === "completed" &&
            participant.mission2_status === "completed"

        if (!allComplete) {
            toast({
                title: "Belum Selesai",
                description: "Peserta belum menyelesaikan semua misi",
                variant: "destructive",
            })
            return
        }

        handleRedeemClick(participant)
    }

    // Loading state
    if (!isAuthed || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0a1a] to-[#0a0a0f] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white">Memuat dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0a1a] to-[#0a0a0f]">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-christmas-gold/5 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 bg-gradient-to-r from-[#0f1419] via-[#1a1020] to-[#0f1419] border-b border-purple-500/20 p-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-xl">
                            <Shield className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
                            <p className="text-xs text-gray-400">Shopping Journey</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => fetchData(true)}
                            variant="ghost"
                            size="sm"
                            disabled={refreshing}
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                        </Button>
                        <Button onClick={handleLogout} variant="ghost" size="sm">
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="relative z-10 p-4 max-w-6xl mx-auto">
                <motion.div
                    initial="initial"
                    animate="animate"
                    variants={staggerContainer}
                    className="space-y-6"
                >
                    {/* Stats grid */}
                    <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard
                            title="Total Peserta"
                            value={stats?.totalParticipants ?? 0}
                            icon={<Users className="w-5 h-5" />}
                            color="purple"
                        />
                        <StatCard
                            title="Misi Selesai"
                            value={stats?.completedMissions ?? 0}
                            icon={<CheckCircle className="w-5 h-5" />}
                            color="green"
                        />
                        <StatCard
                            title="Sudah Redeem"
                            value={stats?.redeemedCount ?? 0}
                            icon={<Award className="w-5 h-5" />}
                            color="gold"
                        />
                        <StatCard
                            title="Sisa Kuota"
                            value={stats?.quotaRemaining ?? 0}
                            icon={<Ticket className="w-5 h-5" />}
                            color="red"
                            subtitle={`dari ${EVENT_CONFIG.totalQuota}`}
                        />
                    </motion.div>

                    {/* Code lookup */}
                    <motion.div variants={fadeInUp}>
                        <CodeLookup onFound={handleCodeFound} />
                    </motion.div>

                    {/* Participants section */}
                    <motion.div variants={fadeInUp}>
                        <Card variant="glass">
                            <CardContent className="p-4">
                                {/* Section header */}
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-white flex items-center gap-2">
                                        <Users className="w-5 h-5 text-purple-400" />
                                        Daftar Peserta
                                    </h3>
                                    <Badge variant="outline">
                                        {participants?.total ?? 0} peserta
                                    </Badge>
                                </div>

                                {/* Search and filter */}
                                <div className="flex gap-2 mb-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <Input
                                            placeholder="Cari nama, telepon, atau kode..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                                        className="bg-gray-800/50 border-2 border-gray-700/50 rounded-xl px-3 text-sm text-white focus:border-purple-500/50 focus:outline-none"
                                    >
                                        <option value="all">Semua</option>
                                        <option value="completed">Selesai</option>
                                        <option value="pending">Belum Selesai</option>
                                        <option value="redeemed">Sudah Redeem</option>
                                    </select>
                                </div>

                                {/* Participant list */}
                                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                    <AnimatePresence>
                                        {participants?.data.map((p) => (
                                            <ParticipantRow
                                                key={p.id}
                                                participant={p}
                                                onRedeem={handleRedeemClick}
                                                onView={handleView}
                                            />
                                        ))}
                                    </AnimatePresence>

                                    {participants?.data.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>Tidak ada peserta ditemukan</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </main>

            {/* Participant detail dialog */}
            <ParticipantDetail
                participant={selectedParticipant}
                open={showDetail}
                onClose={() => {
                    setShowDetail(false)
                    setSelectedParticipant(null)
                }}
                onRedeem={handleRedeemClick}
            />

            {/* Redeem confirmation dialog */}
            <RedeemDialog
                participant={selectedParticipant}
                open={showRedeem}
                onClose={() => {
                    setShowRedeem(false)
                    setSelectedParticipant(null)
                }}
                onConfirm={handleRedeemConfirm}
                loading={redeemLoading}
            />
        </div>
    )
}