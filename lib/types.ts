// lib/types.ts
// Created: TypeScript types for Shopping Journey database schema

/**
 * Mission Status Enum
 */
export type MissionStatus = 'not_started' | 'in_progress' | 'completed'

/**
 * Redemption Status Enum
 */
export type RedemptionStatus = 'pending' | 'redeemed'

/**
 * Participant Record (from Supabase)
 */
export interface Participant {
    id: string
    phone_number: string
    full_name: string
    registration_timestamp: string
    mission1_status: MissionStatus
    mission1_receipt_url: string | null
    mission1_amount: number | null
    mission1_timestamp: string | null
    mission2_status: MissionStatus
    mission2_receipt_url: string | null
    mission2_amount: number | null
    mission2_timestamp: string | null
    redemption_status: RedemptionStatus
    redemption_timestamp: string | null
    redemption_code: string | null
    created_at: string
    updated_at: string
}

/**
 * Quota Tracker Record
 */
export interface QuotaTracker {
    id: string
    total_quota: number
    used_quota: number
    updated_at: string
}

/**
 * Insert types (for creating new participants)
 */
export interface ParticipantInsert {
    phone_number: string
    full_name: string
}

/**
 * Update types (for updating participant records)
 */
export interface ParticipantUpdate {
    mission1_status?: MissionStatus
    mission1_receipt_url?: string | null
    mission1_amount?: number | null
    mission1_timestamp?: string | null
    mission2_status?: MissionStatus
    mission2_receipt_url?: string | null
    mission2_amount?: number | null
    mission2_timestamp?: string | null
    redemption_status?: RedemptionStatus
    redemption_timestamp?: string | null
    redemption_code?: string | null
}

/**
 * Quota status response
 */
export interface QuotaStatus {
    used: number
    total: number
    remaining: number
    isAvailable: boolean
    percentage: number
}

/**
 * Registration response
 */
export interface RegistrationResult {
    success: boolean
    participant?: Participant
    error?: string
}

/**
 * Mission update result
 */
export interface MissionUpdateResult {
    success: boolean
    participant?: Participant
    error?: string
    quotaIncremented?: boolean
}

/**
 * Receipt OCR extracted data
 */
export interface ReceiptOCRData {
    date: string | null
    time: string | null
    amount: number | null
    rawText: string
    confidence: number
}

/**
 * Receipt validation result
 */
export interface ReceiptValidation {
    isValid: boolean
    errors: string[]
    extractedData: ReceiptOCRData
}

/**
 * Mission configuration
 */
export interface MissionConfig {
    id: 1 | 2
    name: string
    fullName: string
    category: string
    minAmount: number
    minTime: string
    minTimeDisplay: string
    description: string
    icon: string
    color: 'red' | 'green'
}

/**
 * Mission state for UI
 */
export interface MissionState {
    id: 1 | 2
    config: MissionConfig
    status: MissionStatus
    receiptUrl: string | null
    amount: number | null
    timestamp: string | null
}

/**
 * Participant session (stored in localStorage)
 */
export interface ParticipantSession {
    id: string
    phone_number: string
    full_name: string
}

/**
 * Admin search parameters
 */
export interface AdminSearchParams {
    query?: string
    status?: 'all' | 'completed' | 'pending' | 'redeemed'
    page?: number
    limit?: number
    sortBy?: 'created_at' | 'full_name' | 'phone_number'
    sortOrder?: 'asc' | 'desc'
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
}

/**
 * Admin stats
 */
export interface AdminStats {
    totalParticipants: number
    completedMissions: number
    redeemedCount: number
    quotaRemaining: number
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
    message?: string
}