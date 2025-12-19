// lib/constants.ts
// Created: App constants and mission configuration

import type { MissionConfig } from './types'

// ===========================================
// EVENT CONFIGURATION
// ===========================================

export const EVENT_CONFIG = {
    name: 'Christmas Super Midnight Sale',
    date: '2025-12-20',
    startTime: '20:00',
    endTime: '00:00',
    location: 'Supermal Karawaci',
    redemptionLocation: 'CS Counter eCenter',
    totalQuota: 100,
    voucherAmount: 100000,
}

// ===========================================
// MISSION CONFIGURATION
// ===========================================

export const MISSION_1: MissionConfig = {
    id: 1,
    name: 'Misi F&B',
    fullName: 'Misi 1: Food & Beverage',
    category: 'Food & Beverage',
    minAmount: 150000,
    minTime: '19:30',
    minTimeDisplay: '19.30 WIB',
    description: 'Belanja di tenant F&B min. Rp 150.000',
    icon: '🍔',
    color: 'red',
}

export const MISSION_2: MissionConfig = {
    id: 2,
    name: 'Misi Fashion',
    fullName: 'Misi 2: Fashion & Accessories',
    category: 'Fashion & Accessories',
    minAmount: 250000,
    minTime: '20:00',
    minTimeDisplay: '20.00 WIB',
    description: 'Belanja di tenant Fashion min. Rp 250.000',
    icon: '👗',
    color: 'green',
}

export const MISSIONS: MissionConfig[] = [MISSION_1, MISSION_2]

export function getMissionConfig(missionId: 1 | 2): MissionConfig {
    return missionId === 1 ? MISSION_1 : MISSION_2
}

// ===========================================
// VALIDATION RULES
// ===========================================

export const VALIDATION = {
    // Phone validation
    phone: {
        minLength: 10,
        maxLength: 15,
        pattern: /^(\+62|62|0)8[1-9][0-9]{7,11}$/,
        errorMessage: 'Masukkan nomor HP Indonesia yang valid (contoh: 081234567890)',
    },

    // Name validation
    name: {
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\u00C0-\u017F\s'.]+$/,
        errorMessage: 'Nama hanya boleh berisi huruf dan spasi (2-50 karakter)',
    },

    // Receipt validation
    receipt: {
        maxSize: 10 * 1024 * 1024, // 10MB
        maxFileSize: 10 * 1024 * 1024, // 10MB (alias)
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.heic'],
    },

    // Admin password
    admin: {
        minLength: 8,
    },
}

// ===========================================
// ERROR MESSAGES
// ===========================================

export const ERROR_MESSAGES = {
    // Registration
    phoneRequired: 'Nomor HP wajib diisi',
    phoneInvalid: 'Format nomor HP tidak valid',
    phoneExists: 'Nomor HP sudah terdaftar',
    phoneRegistered: 'Nomor HP ini sudah terdaftar. Gunakan fitur "Cek Status" untuk masuk.',
    nameRequired: 'Nama lengkap wajib diisi',
    nameInvalid: 'Nama hanya boleh berisi huruf dan spasi',
    nameTooShort: 'Nama minimal 2 karakter',
    nameTooLong: 'Nama maksimal 50 karakter',
    termsRequired: 'Anda harus menyetujui syarat dan ketentuan',

    // Quota
    quotaFull: 'Maaf, kuota voucher sudah habis',

    // Receipt
    receiptRequired: 'Foto struk wajib diupload',
    receiptTooLarge: 'Ukuran file maksimal 10MB',
    receiptInvalidType: 'Format file harus JPG, PNG, atau WebP',
    receiptDateInvalid: 'Struk harus bertanggal 20 Desember 2025',
    receiptTimeInvalid: (minTime: string) => `Waktu transaksi minimal ${minTime}`,
    receiptAmountInvalid: (minAmount: number) => `Jumlah transaksi minimal ${formatRupiahShort(minAmount)}`,

    // Mission
    missionAlreadyCompleted: 'Misi sudah diselesaikan sebelumnya',
    missionNotFound: 'Misi tidak ditemukan',

    // Participant
    notFound: 'Data tidak ditemukan',

    // Validation
    validation: 'Data yang dimasukkan tidak valid',

    // General
    networkError: 'Koneksi terputus. Silakan coba lagi.',
    serverError: 'Terjadi kesalahan. Silakan coba lagi.',
    sessionExpired: 'Sesi Anda telah berakhir. Silakan masuk kembali.',
}

// ===========================================
// SUCCESS MESSAGES
// ===========================================

export const SUCCESS_MESSAGES = {
    registration: 'Pendaftaran berhasil! Selamat datang di Shopping Journey.',
    registrationSuccess: 'Pendaftaran berhasil! Selamat datang di Shopping Journey.',
    missionComplete: 'Misi berhasil diselesaikan!',
    allMissionsComplete: 'Selamat! Anda telah menyelesaikan semua misi.',
    redeemed: 'Voucher berhasil di-redeem!',
    redeemSuccess: 'Voucher berhasil ditukar!',
}

// ===========================================
// FORMATTING HELPERS
// ===========================================

export function formatRupiahShort(amount: number): string {
    if (amount >= 1000000) {
        return `Rp ${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)} juta`
    }
    if (amount >= 1000) {
        return `Rp ${(amount / 1000).toFixed(0)} ribu`
    }
    return `Rp ${amount.toLocaleString('id-ID')}`
}

// ===========================================
// LOCAL STORAGE KEYS
// ===========================================

export const STORAGE_KEYS = {
    participantId: 'participantId',
    participantPhone: 'participantPhone',
    participantName: 'participantName',
    adminSession: 'adminSession',
}

// ===========================================
// API ROUTES
// ===========================================

export const API_ROUTES = {
    // Public endpoints
    quota: '/api/quota',
    register: '/api/register',
    participant: '/api/participant',
    mission: '/api/mission',
    uploadReceipt: '/api/upload-receipt',
    ocr: '/api/ocr',
    health: '/api/health',

    // Admin endpoints
    adminLogin: '/api/admin/login',
    adminStats: '/api/admin/stats',
    adminParticipants: '/api/admin/participants',
    adminRedeem: '/api/admin/redeem',
}

// ===========================================
// PAGE ROUTES
// ===========================================

export const PAGE_ROUTES = {
    home: '/',
    register: '/', // Registration is on home page
    dashboard: '/dashboard',
    mission: (id: number) => `/mission/${id}`,
    success: '/success',
    terms: '/terms',
    adminLogin: '/admin/login',
    adminDashboard: '/admin/dashboard',
}