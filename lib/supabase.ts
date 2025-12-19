// lib/supabase.ts
// Created: Supabase client and database operations for Shopping Journey

import { createClient } from '@supabase/supabase-js'
import type {
  Participant,
  ParticipantInsert,
  ParticipantUpdate,
  QuotaStatus,
  RegistrationResult,
  MissionUpdateResult,
  MissionStatus,
  AdminSearchParams,
  PaginatedResponse,
  AdminStats,
} from './types'
import { generateRedemptionCode } from './utils'

// ===========================================
// SUPABASE CLIENT INITIALIZATION
// ===========================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Singleton quota tracker ID
const QUOTA_TRACKER_ID = '00000000-0000-0000-0000-000000000001'

// ===========================================
// QUOTA OPERATIONS
// ===========================================

/**
 * Get current quota status
 */
export async function getQuotaStatus(): Promise<QuotaStatus> {
  try {
    const { data, error } = await supabase
      .from('quota_tracker')
      .select('total_quota, used_quota')
      .eq('id', QUOTA_TRACKER_ID)
      .single()

    if (error || !data) {
      console.error('Failed to fetch quota:', error)
      return {
        used: 0,
        total: 100,
        remaining: 100,
        isAvailable: true,
        percentage: 0,
      }
    }

    const remaining = data.total_quota - data.used_quota

    return {
      used: data.used_quota,
      total: data.total_quota,
      remaining,
      isAvailable: remaining > 0,
      percentage: Math.round((data.used_quota / data.total_quota) * 100),
    }
  } catch (error) {
    console.error('Quota fetch error:', error)
    return {
      used: 0,
      total: 100,
      remaining: 100,
      isAvailable: true,
      percentage: 0,
    }
  }
}

/**
 * Increment quota (atomic operation via RPC)
 * Returns the new used_quota value, or -1 if quota is full
 */
export async function incrementQuota(): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('increment_quota')

    if (error) {
      console.error('Failed to increment quota:', error)
      return -1
    }

    return data ?? -1
  } catch (error) {
    console.error('Increment quota error:', error)
    return -1
  }
}

/**
 * Decrement quota (for rollbacks)
 */
export async function decrementQuota(): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('decrement_quota')

    if (error) {
      console.error('Failed to decrement quota:', error)
      return -1
    }

    return data ?? -1
  } catch (error) {
    console.error('Decrement quota error:', error)
    return -1
  }
}

// ===========================================
// PARTICIPANT OPERATIONS
// ===========================================

/**
 * Check if phone number is already registered
 */
export async function isPhoneRegistered(phoneNumber: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('id')
      .eq('phone_number', phoneNumber)
      .maybeSingle()

    if (error) {
      console.error('Failed to check phone:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Phone check error:', error)
    return false
  }
}

/**
 * Register a new participant
 */
export async function registerParticipant(
  insertData: ParticipantInsert
): Promise<RegistrationResult> {
  try {
    // Check if already registered
    const exists = await isPhoneRegistered(insertData.phone_number)
    if (exists) {
      return {
        success: false,
        error: 'Nomor telepon sudah terdaftar'
      }
    }

    // Check quota availability
    const quota = await getQuotaStatus()
    if (!quota.isAvailable) {
      return {
        success: false,
        error: 'Maaf, kuota voucher sudah habis'
      }
    }

    // Insert participant
    const { data: participant, error } = await supabase
      .from('participants')
      .insert({
        phone_number: insertData.phone_number,
        full_name: insertData.full_name,
        registration_timestamp: new Date().toISOString(),
        mission1_status: 'not_started' as MissionStatus,
        mission2_status: 'not_started' as MissionStatus,
        redemption_status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to register participant:', error)
      return {
        success: false,
        error: error.message || 'Gagal mendaftar. Silakan coba lagi.'
      }
    }

    return {
      success: true,
      participant: participant as Participant
    }
  } catch (error) {
    console.error('Registration error:', error)
    return {
      success: false,
      error: 'Terjadi kesalahan. Silakan coba lagi.'
    }
  }
}

/**
 * Get participant by phone number
 */
export async function getParticipantByPhone(
  phoneNumber: string
): Promise<Participant | null> {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('phone_number', phoneNumber)
      .maybeSingle()

    if (error) {
      console.error('Failed to get participant:', error)
      return null
    }

    return data as Participant | null
  } catch (error) {
    console.error('Get participant error:', error)
    return null
  }
}

/**
 * Get participant by ID
 */
export async function getParticipantById(
  id: string
): Promise<Participant | null> {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Failed to get participant:', error)
      return null
    }

    return data as Participant | null
  } catch (error) {
    console.error('Get participant error:', error)
    return null
  }
}

/**
 * Update participant mission status
 */
export async function updateMission(
  participantId: string,
  missionId: 1 | 2,
  updateData: {
    status: MissionStatus
    receiptUrl?: string
    amount?: number
  }
): Promise<MissionUpdateResult> {
  try {
    // Get current participant state
    const participant = await getParticipantById(participantId)
    if (!participant) {
      return { success: false, error: 'Peserta tidak ditemukan' }
    }

    // Check if mission already completed
    const currentStatus = missionId === 1
      ? participant.mission1_status
      : participant.mission2_status

    if (currentStatus === 'completed') {
      return { success: false, error: 'Misi sudah diselesaikan sebelumnya' }
    }

    // Build update object
    const missionPrefix = missionId === 1 ? 'mission1' : 'mission2'
    const updateObj: ParticipantUpdate = {
      [`${missionPrefix}_status`]: updateData.status,
      [`${missionPrefix}_receipt_url`]: updateData.receiptUrl || null,
      [`${missionPrefix}_amount`]: updateData.amount || null,
      [`${missionPrefix}_timestamp`]: updateData.status === 'completed'
        ? new Date().toISOString()
        : null,
    }

    // Check if this completes both missions
    const otherMissionComplete = missionId === 1
      ? participant.mission2_status === 'completed'
      : participant.mission1_status === 'completed'

    const bothComplete = updateData.status === 'completed' && otherMissionComplete
    let quotaIncremented = false

    // If both missions complete, increment quota and generate redemption code
    if (bothComplete && participant.redemption_code === null) {
      const newQuota = await incrementQuota()

      if (newQuota === -1) {
        return {
          success: false,
          error: 'Maaf, kuota voucher sudah habis'
        }
      }

      quotaIncremented = true
      updateObj.redemption_code = generateRedemptionCode(participant.phone_number)
    }

    // Update participant
    const { data: updated, error } = await supabase
      .from('participants')
      .update(updateObj)
      .eq('id', participantId)
      .select()
      .single()

    if (error) {
      // Rollback quota if update failed
      if (quotaIncremented) {
        await decrementQuota()
      }
      console.error('Failed to update mission:', error)
      return { success: false, error: 'Gagal menyimpan progress misi' }
    }

    return {
      success: true,
      participant: updated as Participant,
      quotaIncremented,
    }
  } catch (error) {
    console.error('Mission update error:', error)
    return { success: false, error: 'Terjadi kesalahan. Silakan coba lagi.' }
  }
}

/**
 * Mark participant as redeemed (admin only)
 */
export async function markAsRedeemed(
  participantId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('participants')
      .update({
        redemption_status: 'redeemed',
        redemption_timestamp: new Date().toISOString(),
      })
      .eq('id', participantId)
      .eq('redemption_status', 'pending') // Only update if pending

    if (error) {
      console.error('Failed to mark as redeemed:', error)
      return { success: false, error: 'Gagal mengupdate status redeem' }
    }

    return { success: true }
  } catch (error) {
    console.error('Redeem error:', error)
    return { success: false, error: 'Terjadi kesalahan' }
  }
}

/**
 * Get participant by redemption code (admin lookup)
 */
export async function getParticipantByRedemptionCode(
  code: string
): Promise<Participant | null> {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('redemption_code', code.toUpperCase())
      .single()

    if (error) {
      console.error('Failed to find participant by code:', error)
      return null
    }

    return data as Participant
  } catch (error) {
    console.error('Redemption code lookup error:', error)
    return null
  }
}

// ===========================================
// ADMIN OPERATIONS
// ===========================================

/**
 * Get all participants with pagination and search (admin)
 */
export async function getParticipants(
  params: AdminSearchParams = {}
): Promise<PaginatedResponse<Participant>> {
  const {
    query = '',
    status = 'all',
    page = 1,
    limit = 20,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = params

  try {
    let queryBuilder = supabase
      .from('participants')
      .select('*', { count: 'exact' })

    // Apply search filter
    if (query) {
      queryBuilder = queryBuilder.or(
        `full_name.ilike.%${query}%,phone_number.ilike.%${query}%,redemption_code.ilike.%${query}%`
      )
    }

    // Apply status filter
    if (status === 'completed') {
      queryBuilder = queryBuilder
        .eq('mission1_status', 'completed')
        .eq('mission2_status', 'completed')
    } else if (status === 'pending') {
      queryBuilder = queryBuilder.or(
        'mission1_status.neq.completed,mission2_status.neq.completed'
      )
    } else if (status === 'redeemed') {
      queryBuilder = queryBuilder.eq('redemption_status', 'redeemed')
    }

    // Apply sorting
    queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    queryBuilder = queryBuilder.range(from, to)

    const { data, error, count } = await queryBuilder

    if (error) {
      console.error('Failed to get participants:', error)
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        hasMore: false,
      }
    }

    const total = count ?? 0
    const totalPages = Math.ceil(total / limit)

    return {
      data: (data as Participant[]) || [],
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    }
  } catch (error) {
    console.error('Get participants error:', error)
    return {
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
      hasMore: false,
    }
  }
}

/**
 * Get admin dashboard stats
 */
export async function getAdminStats(): Promise<AdminStats> {
  try {
    // Get total participants
    const { count: totalParticipants } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true })

    // Get completed (both missions done)
    const { count: completedMissions } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('mission1_status', 'completed')
      .eq('mission2_status', 'completed')

    // Get redeemed count
    const { count: redeemedCount } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('redemption_status', 'redeemed')

    // Get quota
    const quota = await getQuotaStatus()

    return {
      totalParticipants: totalParticipants ?? 0,
      completedMissions: completedMissions ?? 0,
      redeemedCount: redeemedCount ?? 0,
      quotaRemaining: quota.remaining,
    }
  } catch (error) {
    console.error('Admin stats error:', error)
    return {
      totalParticipants: 0,
      completedMissions: 0,
      redeemedCount: 0,
      quotaRemaining: 100,
    }
  }
}

// ===========================================
// STORAGE OPERATIONS
// ===========================================

/**
 * Upload receipt image to Supabase Storage
 */
export async function uploadReceipt(
  participantId: string,
  missionId: 1 | 2,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${participantId}_mission${missionId}_${Date.now()}.${fileExt}`
    const filePath = `receipts/${fileName}`

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { url: null, error: 'Gagal mengupload gambar struk' }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath)

    return { url: publicUrl, error: null }
  } catch (error) {
    console.error('Upload receipt error:', error)
    return { url: null, error: 'Terjadi kesalahan saat upload' }
  }
}

// ===========================================
// REALTIME SUBSCRIPTIONS
// ===========================================

/**
 * Subscribe to quota changes
 */
export function subscribeToQuota(
  callback: (quota: QuotaStatus) => void
): () => void {
  const channel = supabase
    .channel('quota-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'quota_tracker',
        filter: `id=eq.${QUOTA_TRACKER_ID}`,
      },
      async () => {
        const quota = await getQuotaStatus()
        callback(quota)
      }
    )
    .subscribe()

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Subscribe to participant changes
 */
export function subscribeToParticipant(
  participantId: string,
  callback: (participant: Participant) => void
): () => void {
  const channel = supabase
    .channel(`participant-${participantId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'participants',
        filter: `id=eq.${participantId}`,
      },
      (payload) => {
        callback(payload.new as Participant)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// ===========================================
// EXPORT API OBJECT (backwards compatible with Spooky Hunt pattern)
// ===========================================

export const supabaseApi = {
  supabase,

  // Quota
  getQuotaStatus,
  incrementQuota,
  decrementQuota,

  // Participants
  isPhoneRegistered,
  registerParticipant,
  getParticipantByPhone,
  getParticipantById,
  updateMission,
  markAsRedeemed,
  getParticipantByRedemptionCode,

  // Admin
  getParticipants,
  getAdminStats,

  // Storage
  uploadReceipt,

  // Realtime
  subscribeToQuota,
  subscribeToParticipant,
}

export default supabaseApi