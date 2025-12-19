// app/dashboard/page.tsx
// Created: Dashboard with mission progress and navigation

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Gift,
  Utensils,
  Shirt,
  ChevronRight,
  Check,
  Clock,
  Lock,
  Camera,
  Sparkles,
  Trophy,
  RefreshCw,
  AlertCircle,
  PartyPopper,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import Header, { QuotaDisplay } from "@/components/Header"
import { SegmentedProgressBar } from "@/components/ui/segmented-progress"

import { useParticipant } from "@/hooks/useParticipant"
import { useQuota } from "@/hooks/useQuota"
import { formatRupiah, formatTime } from "@/lib/utils"
import {
  EVENT_CONFIG,
  MISSION_1,
  MISSION_2,
  PAGE_ROUTES,
} from "@/lib/constants"
import type { MissionState, MissionStatus } from "@/lib/types"

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
      staggerChildren: 0.1,
    },
  },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
}

const pulseGlow = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(220, 38, 38, 0.3)",
      "0 0 40px rgba(220, 38, 38, 0.5)",
      "0 0 20px rgba(220, 38, 38, 0.3)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
}

// ===========================================
// MISSION CARD COMPONENT
// ===========================================

interface MissionCardProps {
  mission: MissionState
  index: number
  isLocked: boolean
  onStart: () => void
}

function MissionCard({ mission, index, isLocked, onStart }: MissionCardProps) {
  const { config, status, amount, timestamp } = mission
  const isCompleted = status === "completed"
  const isAvailable = !isLocked && !isCompleted

  // Determine card styling based on status
  const getCardStyle = () => {
    if (isCompleted) {
      return config.id === 1
        ? "border-christmas-red/50 bg-gradient-to-br from-christmas-red/20 to-red-900/10"
        : "border-christmas-green/50 bg-gradient-to-br from-christmas-green/20 to-green-900/10"
    }
    if (isLocked) {
      return "border-gray-700/50 bg-gray-800/30 opacity-60"
    }
    return config.id === 1
      ? "border-christmas-red/30 bg-gradient-to-br from-gray-800/50 to-red-950/20 hover:border-christmas-red/50"
      : "border-christmas-green/30 bg-gradient-to-br from-gray-800/50 to-green-950/20 hover:border-christmas-green/50"
  }

  const getIconBg = () => {
    if (isCompleted) {
      return config.id === 1 ? "bg-christmas-red" : "bg-christmas-green"
    }
    if (isLocked) {
      return "bg-gray-700"
    }
    return config.id === 1 ? "bg-christmas-red/20" : "bg-christmas-green/20"
  }

  const getIconColor = () => {
    if (isCompleted || isLocked) {
      return "text-white"
    }
    return config.id === 1 ? "text-christmas-red" : "text-christmas-green"
  }

  const Icon = config.id === 1 ? Utensils : Shirt

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={{ delay: index * 0.1 }}
      whileHover={isAvailable ? { scale: 1.02 } : undefined}
      whileTap={isAvailable ? { scale: 0.98 } : undefined}
    >
      <Card
        className={`relative overflow-hidden transition-all duration-300 ${getCardStyle()}`}
      >
        {/* Completed badge */}
        {isCompleted && (
          <div className="absolute top-3 right-3">
            <Badge variant="success" className="gap-1">
              <Check className="w-3 h-3" />
              Selesai
            </Badge>
          </div>
        )}

        {/* Locked overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] z-10">
            <div className="text-center">
              <Lock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Selesaikan misi sebelumnya</p>
            </div>
          </div>
        )}

        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getIconBg()} transition-colors`}
            >
              {isCompleted ? (
                <Check className="w-7 h-7 text-white" />
              ) : (
                <Icon className={`w-7 h-7 ${getIconColor()}`} />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  Misi {config.id}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{config.category}</h3>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Minimum Belanja</span>
              <span
                className={`font-bold ${config.id === 1 ? "text-christmas-red" : "text-christmas-green"
                  }`}
              >
                {formatRupiah(config.minAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Waktu Transaksi</span>
              <span className="text-white flex items-center gap-1">
                <Clock className="w-3 h-3" />
                ≥ {config.minTimeDisplay}
              </span>
            </div>
          </div>

          {/* Completed info */}
          {isCompleted && amount && (
            <div className="bg-gray-800/50 rounded-xl p-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Total Belanja</span>
                <span className="font-bold text-christmas-gold">
                  {formatRupiah(amount)}
                </span>
              </div>
              {timestamp && (
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-400">Waktu</span>
                  <span className="text-gray-300">{formatTime(timestamp)}</span>
                </div>
              )}
            </div>
          )}

          {/* Action button */}
          {!isCompleted && !isLocked && (
            <Button
              onClick={onStart}
              className="w-full"
              variant={config.id === 1 ? "default" : "secondary"}
            >
              <Camera className="w-4 h-4 mr-2" />
              Upload Struk
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}

          {isCompleted && (
            <div className="flex items-center justify-center gap-2 text-sm text-christmas-green">
              <Check className="w-4 h-4" />
              Misi telah diselesaikan
            </div>
          )}
        </CardContent>

        {/* Glow effect for available missions */}
        {isAvailable && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            animate={{
              boxShadow:
                config.id === 1
                  ? [
                    "inset 0 0 20px rgba(220, 38, 38, 0)",
                    "inset 0 0 20px rgba(220, 38, 38, 0.1)",
                    "inset 0 0 20px rgba(220, 38, 38, 0)",
                  ]
                  : [
                    "inset 0 0 20px rgba(22, 163, 74, 0)",
                    "inset 0 0 20px rgba(22, 163, 74, 0.1)",
                    "inset 0 0 20px rgba(22, 163, 74, 0)",
                  ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </Card>
    </motion.div>
  )
}

// ===========================================
// SUCCESS CELEBRATION COMPONENT
// ===========================================

function SuccessCelebration({ onClaim }: { onClaim: () => void }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={scaleIn}
      className="text-center py-8"
    >
      {/* Trophy animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="relative inline-block mb-6"
      >
        <div className="w-28 h-28 bg-gradient-to-br from-christmas-gold to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-christmas-gold/50">
          <Trophy className="w-14 h-14 text-white" />
        </div>

        {/* Sparkles */}
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Sparkles className="w-8 h-8 text-christmas-gold" />
        </motion.div>
        <motion.div
          className="absolute -bottom-2 -left-2"
          animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        >
          <PartyPopper className="w-8 h-8 text-christmas-red" />
        </motion.div>
      </motion.div>

      {/* Congratulations text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          Selamat! 🎉
        </h2>
        <p className="text-gray-400 mb-2">
          Anda telah menyelesaikan semua misi
        </p>
        <p className="text-christmas-gold font-semibold mb-6">
          Klaim voucher Anda sekarang!
        </p>
      </motion.div>

      {/* Voucher preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="mb-6"
      >
        <Card variant="gold" className="inline-block">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-christmas-gold/30 rounded-xl">
                <Gift className="w-8 h-8 text-christmas-gold" />
              </div>
              <div className="text-left">
                <p className="text-xs text-christmas-gold/70 uppercase tracking-wider">
                  Cash Voucher
                </p>
                <p className="text-2xl font-bold text-christmas-gold">
                  {formatRupiah(EVENT_CONFIG.voucherAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Claim button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Button onClick={onClaim} variant="gold" size="lg" className="w-full max-w-xs">
          <Gift className="w-5 h-5 mr-2" />
          Klaim Voucher
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </motion.div>
    </motion.div>
  )
}

// ===========================================
// MAIN DASHBOARD COMPONENT
// ===========================================

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()

  const {
    participant,
    session,
    missions,
    loading,
    error,
    allMissionsComplete,
    refresh,
    logout,
  } = useParticipant({ requireAuth: true, realtime: true })

  const { quota } = useQuota({ realtime: true })

  // Calculate progress
  const completedCount = missions.filter((m) => m.status === "completed").length
  const progressPercentage = (completedCount / 2) * 100

  // Handle mission start
  const handleStartMission = (missionId: 1 | 2) => {
    router.push(PAGE_ROUTES.mission(missionId))
  }

  // Handle claim voucher
  const handleClaimVoucher = () => {
    router.push(PAGE_ROUTES.success)
  }

  // Handle logout
  const handleLogout = () => {
    logout()
    router.push(PAGE_ROUTES.home)
    toast({
      title: "Berhasil Keluar",
      description: "Sampai jumpa kembali!",
    })
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0f0f] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-christmas-red/30 border-t-christmas-red rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0f0f] to-[#0a0a0f] flex items-center justify-center p-4">
        <Card variant="christmas" className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-christmas-red mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">Terjadi Kesalahan</h2>
            <p className="text-gray-400 text-sm mb-4">{error}</p>
            <div className="flex gap-3">
              <Button onClick={refresh} variant="outline" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Coba Lagi
              </Button>
              <Button onClick={handleLogout} variant="ghost" className="flex-1">
                Keluar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0f0f] to-[#0a0a0f]">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-christmas-red/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-christmas-green/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-christmas-gold/5 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <Header
        title="Shopping Journey"
        subtitle={session?.full_name}
        action={
          quota && (
            <QuotaDisplay remaining={quota.remaining} total={quota.total} />
          )
        }
      />

      {/* Content */}
      <main className="relative z-10 p-4 pb-24 max-w-lg mx-auto">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-6"
        >
          {/* Welcome & Progress */}
          <motion.div variants={fadeInUp}>
            <Card variant="glass">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Halo, {session?.full_name?.split(" ")[0]}! 👋
                    </h2>
                    <p className="text-sm text-gray-400">
                      {allMissionsComplete
                        ? "Semua misi selesai!"
                        : `Selesaikan ${2 - completedCount} misi lagi`}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-christmas-gold">
                      {completedCount}/2
                    </div>
                    <p className="text-xs text-gray-500">Misi Selesai</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Progress</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <SegmentedProgressBar
                    current={completedCount}
                    total={2}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* All Missions Complete - Celebration */}
          <AnimatePresence>
            {allMissionsComplete && (
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Card variant="gold">
                  <CardContent className="p-0">
                    <SuccessCelebration onClaim={handleClaimVoucher} />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mission Cards */}
          {!allMissionsComplete && (
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-christmas-gold" />
                <h3 className="text-lg font-bold text-white">Misi Belanja</h3>
              </div>

              {missions.map((mission, index) => {
                // Mission 2 is locked until Mission 1 is complete
                // Actually, for this event, both missions can be done in any order
                // But we'll keep them both available
                const isLocked = false

                return (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    index={index}
                    isLocked={isLocked}
                    onStart={() => handleStartMission(mission.id)}
                  />
                )
              })}
            </motion.div>
          )}

          {/* Voucher info */}
          <motion.div variants={fadeInUp}>
            <Card variant="christmas" className="border-dashed">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-christmas-gold/20 rounded-xl">
                    <Gift className="w-6 h-6 text-christmas-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      Hadiah Menanti!
                    </p>
                    <p className="text-xs text-gray-400">
                      Selesaikan 2 misi untuk mendapatkan voucher{" "}
                      <span className="text-christmas-gold font-semibold">
                        {formatRupiah(EVENT_CONFIG.voucherAmount)}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Event info */}
          <motion.div variants={fadeInUp}>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>
                  {EVENT_CONFIG.startTime} - {EVENT_CONFIG.endTime} WIB
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Gift className="w-3 h-3" />
                <span>
                  Sisa {quota?.remaining ?? "..."}/{quota?.total ?? 100} voucher
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}