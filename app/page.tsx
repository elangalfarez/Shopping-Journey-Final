// app/page.tsx
// Created: Landing page with registration flow for Shopping Journey

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Gift,
  User,
  Phone,
  ChevronRight,
  ArrowLeft,
  Check,
  Sparkles,
  Clock,
  MapPin,
  TreePine,
  ShoppingBag,
  Utensils,
  Shirt,
  AlertCircle,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { StepProgress } from "@/components/ui/segmented-progress"
import { QuotaDisplay } from "@/components/Header"
import { TermsModal } from "@/components/TermsModal"

import { useQuota } from "@/hooks/useQuota"
import { registerParticipant, getParticipantByPhone } from "@/lib/supabase"
import { registrationSchema, normalizePhoneNumber } from "@/lib/validations"
import { formatRupiah, setLocalStorage } from "@/lib/utils"
import {
  EVENT_CONFIG,
  MISSION_1,
  MISSION_2,
  STORAGE_KEYS,
  PAGE_ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "@/lib/constants"

// ===========================================
// TYPES
// ===========================================

interface FormData {
  name: string
  phone: string
  acceptTerms: boolean
}

type FormErrors = Partial<Record<keyof FormData | 'general', string>>

type Step = 1 | 2 | 3

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

// ===========================================
// MAIN COMPONENT
// ===========================================

export default function HomePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { quota, loading: quotaLoading } = useQuota({ realtime: true })

  // Form state
  const [step, setStep] = useState<Step>(1)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    acceptTerms: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  // Recovery mode state
  const [showRecovery, setShowRecovery] = useState(false)
  const [recoveryPhone, setRecoveryPhone] = useState("")
  const [recoveryLoading, setRecoveryLoading] = useState(false)

  // Terms modal state
  const [showTermsModal, setShowTermsModal] = useState(false)

  // Check for existing session on mount
  useEffect(() => {
    const existingId = localStorage.getItem(STORAGE_KEYS.participantId)
    if (existingId) {
      router.push(PAGE_ROUTES.dashboard)
    }
  }, [router])

  // ===========================================
  // FORM HANDLERS
  // ===========================================

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field error on change
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateStep = (): boolean => {
    const newErrors: FormErrors = {}

    if (step === 1) {
      // Validate name
      if (!formData.name.trim()) {
        newErrors.name = ERROR_MESSAGES.nameRequired
      } else if (formData.name.trim().length < 2) {
        newErrors.name = ERROR_MESSAGES.nameTooShort
      }

      // Validate phone
      if (!formData.phone.trim()) {
        newErrors.phone = ERROR_MESSAGES.phoneRequired
      } else {
        const phoneDigits = formData.phone.replace(/\D/g, "")
        if (phoneDigits.length < 10 || phoneDigits.length > 15) {
          newErrors.phone = ERROR_MESSAGES.phoneInvalid
        }
      }
    }

    if (step === 2) {
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = ERROR_MESSAGES.termsRequired
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    if (!validateStep()) return

    if (step === 1) {
      setStep(2)
    } else if (step === 2) {
      await handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as Step)
      setErrors({})
    }
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    // Check quota
    if (quota && !quota.isAvailable) {
      toast({
        title: "Kuota Habis",
        description: ERROR_MESSAGES.quotaFull,
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setErrors({})

    try {
      // Validate with Zod
      const validationResult = registrationSchema.safeParse({
        name: formData.name,
        phone: formData.phone,
        acceptTerms: formData.acceptTerms,
      })

      if (!validationResult.success) {
        const fieldErrors: FormErrors = {}
        validationResult.error.errors.forEach((err) => {
          const field = err.path[0] as keyof FormData
          fieldErrors[field] = err.message
        })
        setErrors(fieldErrors)
        setLoading(false)
        return
      }

      // Register participant
      const result = await registerParticipant({
        phone_number: validationResult.data.phone,
        full_name: validationResult.data.name,
      })

      if (!result.success || !result.participant) {
        setErrors({ general: result.error || ERROR_MESSAGES.serverError })
        toast({
          title: "Pendaftaran Gagal",
          description: result.error,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Save session
      setLocalStorage(STORAGE_KEYS.participantId, result.participant.id)
      setLocalStorage(STORAGE_KEYS.participantPhone, result.participant.phone_number)
      setLocalStorage(STORAGE_KEYS.participantName, result.participant.full_name)

      // Show success
      setStep(3)

      toast({
        title: "Pendaftaran Berhasil!",
        description: SUCCESS_MESSAGES.registration,
        variant: "success",
      })

      // Redirect after animation
      setTimeout(() => {
        router.push(PAGE_ROUTES.dashboard)
      }, 2000)

    } catch (error) {
      console.error("Registration error:", error)
      setErrors({ general: ERROR_MESSAGES.serverError })
      toast({
        title: "Error",
        description: ERROR_MESSAGES.serverError,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // ===========================================
  // RECOVERY HANDLER
  // ===========================================

  const handleRecovery = async () => {
    if (!recoveryPhone || recoveryPhone.replace(/\D/g, "").length < 10) {
      toast({
        title: "Error",
        description: ERROR_MESSAGES.phoneInvalid,
        variant: "destructive",
      })
      return
    }

    setRecoveryLoading(true)

    try {
      const normalizedPhone = normalizePhoneNumber(recoveryPhone)
      const participant = await getParticipantByPhone(normalizedPhone)

      if (!participant) {
        toast({
          title: "Tidak Ditemukan",
          description: "Nomor HP tidak terdaftar",
          variant: "destructive",
        })
        setRecoveryLoading(false)
        return
      }

      // Save session
      setLocalStorage(STORAGE_KEYS.participantId, participant.id)
      setLocalStorage(STORAGE_KEYS.participantPhone, participant.phone_number)
      setLocalStorage(STORAGE_KEYS.participantName, participant.full_name)

      toast({
        title: "Selamat Datang Kembali!",
        description: `Halo ${participant.full_name}`,
      })

      router.push(PAGE_ROUTES.dashboard)

    } catch (error) {
      console.error("Recovery error:", error)
      toast({
        title: "Error",
        description: ERROR_MESSAGES.serverError,
        variant: "destructive",
      })
    } finally {
      setRecoveryLoading(false)
    }
  }

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0f0f] to-[#0a0a0f] overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-christmas-red/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-christmas-green/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-christmas-gold/5 rounded-full blur-[80px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-christmas-red/20 rounded-xl">
              <TreePine className="w-6 h-6 text-christmas-red" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Supermal Karawaci</h1>
              <p className="text-xs text-gray-400">Shopping Journey</p>
            </div>
          </div>

          {/* Quota badge */}
          {quota && (
            <QuotaDisplay
              remaining={quota.remaining}
              total={quota.total}
            />
          )}
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 pb-8">
          <AnimatePresence mode="wait">
            {/* Step 1 & 2: Registration Form */}
            {step < 3 && !showRecovery && (
              <motion.div
                key="registration"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={fadeInUp}
                className="max-w-md mx-auto"
              >
                {/* Hero section */}
                <motion.div
                  className="text-center mb-6 mt-4"
                  variants={staggerContainer}
                >
                  <motion.div variants={fadeInUp} className="mb-4">
                    <Badge variant="christmas" className="mb-3">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {EVENT_CONFIG.date.split("-").reverse().join("/")} • {EVENT_CONFIG.startTime} - {EVENT_CONFIG.endTime}
                    </Badge>
                  </motion.div>

                  <motion.h2
                    variants={fadeInUp}
                    className="text-2xl md:text-3xl font-bold mb-2"
                  >
                    <span className="text-gradient-christmas">Christmas</span>
                    <br />
                    <span className="text-white">Super Midnight Sale</span>
                  </motion.h2>

                  <motion.p
                    variants={fadeInUp}
                    className="text-gray-400 text-sm"
                  >
                    Selesaikan 2 misi belanja dan menangkan
                  </motion.p>

                  <motion.div
                    variants={scaleIn}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-christmas-gold/20 rounded-full border border-christmas-gold/30"
                  >
                    <Gift className="w-5 h-5 text-christmas-gold" />
                    <span className="text-christmas-gold font-bold text-lg">
                      {formatRupiah(EVENT_CONFIG.voucherAmount)}
                    </span>
                    <span className="text-christmas-gold/70 text-sm">Cash Voucher</span>
                  </motion.div>
                </motion.div>

                {/* Mission preview cards */}
                <motion.div
                  variants={fadeInUp}
                  className="grid grid-cols-2 gap-3 mb-6"
                >
                  <Card variant="christmas" className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-christmas-red/30 rounded-lg">
                        <Utensils className="w-4 h-4 text-christmas-red" />
                      </div>
                      <span className="text-xs font-semibold text-white">Misi 1</span>
                    </div>
                    <p className="text-xs text-gray-400">F&B</p>
                    <p className="text-sm font-bold text-christmas-red">
                      Min. {formatRupiah(MISSION_1.minAmount)}
                    </p>
                  </Card>

                  <Card variant="success" className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-christmas-green/30 rounded-lg">
                        <Shirt className="w-4 h-4 text-christmas-green" />
                      </div>
                      <span className="text-xs font-semibold text-white">Misi 2</span>
                    </div>
                    <p className="text-xs text-gray-400">Fashion</p>
                    <p className="text-sm font-bold text-christmas-green">
                      Min. {formatRupiah(MISSION_2.minAmount)}
                    </p>
                  </Card>
                </motion.div>

                {/* Step indicator */}
                <motion.div variants={fadeInUp} className="mb-6">
                  <StepProgress
                    currentStep={step}
                    totalSteps={2}
                    icons={[
                      <User key="1" className="w-5 h-5" />,
                      <Check key="2" className="w-5 h-5" />,
                    ]}
                  />
                </motion.div>

                {/* Form card */}
                <motion.div variants={fadeInUp}>
                  <Card variant="glass" className="overflow-hidden">
                    <CardContent className="p-6">
                      <AnimatePresence mode="wait">
                        {/* Step 1: Personal Info */}
                        {step === 1 && (
                          <motion.div
                            key="step1"
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={fadeInUp}
                            className="space-y-4"
                          >
                            <div className="text-center mb-4">
                              <h3 className="text-lg font-bold text-white">Daftar Sekarang</h3>
                              <p className="text-sm text-gray-400">Isi data diri Anda</p>
                            </div>

                            {/* Name input */}
                            <div className="space-y-2">
                              <Label htmlFor="name" className="text-gray-300">
                                Nama Lengkap
                              </Label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <Input
                                  id="name"
                                  type="text"
                                  placeholder="Masukkan nama lengkap"
                                  value={formData.name}
                                  onChange={(e) => handleInputChange("name", e.target.value)}
                                  className="pl-10"
                                  error={!!errors.name}
                                  autoComplete="name"
                                />
                              </div>
                              {errors.name && (
                                <p className="text-xs text-christmas-red flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {errors.name}
                                </p>
                              )}
                            </div>

                            {/* Phone input */}
                            <div className="space-y-2">
                              <Label htmlFor="phone" className="text-gray-300">
                                Nomor WhatsApp
                              </Label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <Input
                                  id="phone"
                                  type="tel"
                                  placeholder="081234567890"
                                  value={formData.phone}
                                  onChange={(e) => handleInputChange("phone", e.target.value)}
                                  className="pl-10"
                                  error={!!errors.phone}
                                  autoComplete="tel"
                                  inputMode="numeric"
                                />
                              </div>
                              {errors.phone && (
                                <p className="text-xs text-christmas-red flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {errors.phone}
                                </p>
                              )}
                            </div>

                            {/* Next button */}
                            <Button
                              onClick={handleNext}
                              className="w-full"
                              size="lg"
                            >
                              Lanjutkan
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>

                            {/* Recovery link */}
                            <div className="text-center pt-2">
                              <button
                                type="button"
                                onClick={() => setShowRecovery(true)}
                                className="text-sm text-gray-400 hover:text-christmas-gold transition-colors"
                              >
                                Sudah pernah daftar? <span className="text-christmas-gold">Cek status</span>
                              </button>
                            </div>
                          </motion.div>
                        )}

                        {/* Step 2: Confirmation */}
                        {step === 2 && (
                          <motion.div
                            key="step2"
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={fadeInUp}
                            className="space-y-4"
                          >
                            <div className="text-center mb-4">
                              <h3 className="text-lg font-bold text-white">Konfirmasi Data</h3>
                              <p className="text-sm text-gray-400">Pastikan data Anda sudah benar</p>
                            </div>

                            {/* Data summary */}
                            <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">Nama</span>
                                <span className="text-white font-medium">{formData.name}</span>
                              </div>
                              <div className="h-px bg-gray-700" />
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">WhatsApp</span>
                                <span className="text-white font-medium">{formData.phone}</span>
                              </div>
                            </div>

                            {/* Terms checkbox */}
                            <div className="flex items-start gap-3 p-4 bg-gray-800/30 rounded-xl">
                              <Checkbox
                                id="terms"
                                checked={formData.acceptTerms}
                                onCheckedChange={(checked) =>
                                  handleInputChange("acceptTerms", checked as boolean)
                                }
                                className="mt-0.5"
                              />
                              <label
                                htmlFor="terms"
                                className="text-sm text-gray-300 cursor-pointer"
                              >
                                Saya menyetujui{" "}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setShowTermsModal(true)
                                  }}
                                  className="text-christmas-gold hover:underline font-medium"
                                >
                                  Syarat & Ketentuan
                                </button>
                                {" "}yang berlaku
                              </label>
                            </div>
                            {errors.acceptTerms && (
                              <p className="text-xs text-christmas-red flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.acceptTerms}
                              </p>
                            )}

                            {/* Error message */}
                            {errors.general && (
                              <div className="p-3 bg-christmas-red/10 border border-christmas-red/30 rounded-xl">
                                <p className="text-sm text-christmas-red flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4" />
                                  {errors.general}
                                </p>
                              </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-3">
                              <Button
                                onClick={handleBack}
                                variant="outline"
                                className="flex-1"
                              >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Kembali
                              </Button>
                              <Button
                                onClick={handleNext}
                                loading={loading}
                                className="flex-1"
                              >
                                {loading ? "Mendaftar..." : "Daftar"}
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Event info */}
                <motion.div
                  variants={fadeInUp}
                  className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-gray-500"
                >
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{EVENT_CONFIG.startTime} - {EVENT_CONFIG.endTime} WIB</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{EVENT_CONFIG.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    <span>{EVENT_CONFIG.totalQuota} voucher tersedia</span>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <motion.div
                key="success"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={scaleIn}
                className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-24 h-24 bg-gradient-to-br from-christmas-green to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-christmas-green/50"
                >
                  <Check className="w-12 h-12 text-white" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  Pendaftaran Berhasil!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-400 mb-4"
                >
                  Selamat datang, <span className="text-christmas-gold">{formData.name}</span>
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-2 text-gray-500"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Mengalihkan ke dashboard...</span>
                </motion.div>
              </motion.div>
            )}

            {/* Recovery mode */}
            {showRecovery && (
              <motion.div
                key="recovery"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={fadeInUp}
                className="max-w-md mx-auto mt-8"
              >
                <Card variant="glass">
                  <CardContent className="p-6 space-y-4">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-christmas-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-8 h-8 text-christmas-gold" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Cek Status</h3>
                      <p className="text-sm text-gray-400">Masukkan nomor HP yang terdaftar</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recovery-phone" className="text-gray-300">
                        Nomor WhatsApp
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <Input
                          id="recovery-phone"
                          type="tel"
                          placeholder="081234567890"
                          value={recoveryPhone}
                          onChange={(e) => setRecoveryPhone(e.target.value)}
                          className="pl-10"
                          inputMode="numeric"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleRecovery}
                      loading={recoveryLoading}
                      className="w-full"
                      variant="gold"
                    >
                      Cari Progress Saya
                    </Button>

                    <Button
                      onClick={() => setShowRecovery(false)}
                      variant="ghost"
                      className="w-full"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Kembali ke Pendaftaran
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="p-4 text-center">
          <p className="text-xs text-gray-600">
            © 2025 Supermal Karawaci. All rights reserved.
          </p>
        </footer>
      </div>

      {/* Terms Modal */}
      <TermsModal
        open={showTermsModal}
        onOpenChange={setShowTermsModal}
        onAgree={() => handleInputChange("acceptTerms", true)}
      />
    </div>
  )
}