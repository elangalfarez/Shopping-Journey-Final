// hooks/useParticipant.ts
// Created: Participant data management hook

"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    getParticipantById,
    getParticipantByPhone,
    subscribeToParticipant
} from '@/lib/supabase'
import {
    getLocalStorage,
    setLocalStorage,
    removeLocalStorage
} from '@/lib/utils'
import { STORAGE_KEYS, PAGE_ROUTES } from '@/lib/constants'
import type { Participant, ParticipantSession, MissionState } from '@/lib/types'
import { MISSIONS, getMissionConfig } from '@/lib/constants'

interface UseParticipantOptions {
    /** Require authentication - redirect to home if not logged in */
    requireAuth?: boolean
    /** Enable real-time subscription */
    realtime?: boolean
}

interface UseParticipantReturn {
    participant: Participant | null
    session: ParticipantSession | null
    missions: MissionState[]
    loading: boolean
    error: string | null
    isAuthenticated: boolean
    allMissionsComplete: boolean
    refresh: () => Promise<void>
    logout: () => void
    setSession: (participant: Participant) => void
}

/**
 * Hook for managing participant data and session
 */
export function useParticipant(options: UseParticipantOptions = {}): UseParticipantReturn {
    const { requireAuth = false, realtime = true } = options
    const router = useRouter()

    const [participant, setParticipant] = useState<Participant | null>(null)
    const [session, setSessionState] = useState<ParticipantSession | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Load session from localStorage
    const loadSession = useCallback((): ParticipantSession | null => {
        const id = getLocalStorage<string>(STORAGE_KEYS.participantId, '')
        const phone = getLocalStorage<string>(STORAGE_KEYS.participantPhone, '')
        const name = getLocalStorage<string>(STORAGE_KEYS.participantName, '')

        if (id && phone && name) {
            return { id, phone_number: phone, full_name: name }
        }
        return null
    }, [])

    // Save session to localStorage
    const saveSession = useCallback((participant: Participant) => {
        setLocalStorage(STORAGE_KEYS.participantId, participant.id)
        setLocalStorage(STORAGE_KEYS.participantPhone, participant.phone_number)
        setLocalStorage(STORAGE_KEYS.participantName, participant.full_name)
        setSessionState({
            id: participant.id,
            phone_number: participant.phone_number,
            full_name: participant.full_name,
        })
    }, [])

    // Clear session from localStorage
    const clearSession = useCallback(() => {
        removeLocalStorage(STORAGE_KEYS.participantId)
        removeLocalStorage(STORAGE_KEYS.participantPhone)
        removeLocalStorage(STORAGE_KEYS.participantName)
        setSessionState(null)
        setParticipant(null)
    }, [])

    // Fetch participant data
    const fetchParticipant = useCallback(async (sessionData: ParticipantSession) => {
        try {
            const data = await getParticipantById(sessionData.id)

            if (!data) {
                // Session invalid, clear it
                clearSession()
                setError('Sesi tidak valid')
                return
            }

            setParticipant(data)
            setError(null)
        } catch (err) {
            console.error('Failed to fetch participant:', err)
            setError('Gagal memuat data peserta')
        } finally {
            setLoading(false)
        }
    }, [clearSession])

    // Initialize
    useEffect(() => {
        const sessionData = loadSession()
        setSessionState(sessionData)

        if (sessionData) {
            fetchParticipant(sessionData)
        } else {
            setLoading(false)

            if (requireAuth) {
                router.push(PAGE_ROUTES.home)
            }
        }
    }, [loadSession, fetchParticipant, requireAuth, router])

    // Real-time subscription
    useEffect(() => {
        if (!realtime || !session?.id) return

        const unsubscribe = subscribeToParticipant(session.id, (updated) => {
            setParticipant(updated)
        })

        return () => {
            unsubscribe()
        }
    }, [realtime, session?.id])

    // Build mission states
    const missions: MissionState[] = MISSIONS.map((config) => {
        const missionId = config.id
        const status = participant
            ? missionId === 1
                ? participant.mission1_status
                : participant.mission2_status
            : 'not_started'
        const receiptUrl = participant
            ? missionId === 1
                ? participant.mission1_receipt_url
                : participant.mission2_receipt_url
            : null
        const amount = participant
            ? missionId === 1
                ? participant.mission1_amount
                : participant.mission2_amount
            : null
        const timestamp = participant
            ? missionId === 1
                ? participant.mission1_timestamp
                : participant.mission2_timestamp
            : null

        return {
            id: missionId,
            config,
            status,
            receiptUrl,
            amount,
            timestamp,
        }
    })

    const allMissionsComplete = participant
        ? participant.mission1_status === 'completed' &&
        participant.mission2_status === 'completed'
        : false

    return {
        participant,
        session,
        missions,
        loading,
        error,
        isAuthenticated: !!session,
        allMissionsComplete,
        refresh: async () => {
            if (session) {
                await fetchParticipant(session)
            }
        },
        logout: clearSession,
        setSession: saveSession,
    }
}

export default useParticipant