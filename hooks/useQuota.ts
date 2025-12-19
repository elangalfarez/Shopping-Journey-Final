// hooks/useQuota.ts
// Created: Real-time quota tracking hook

"use client"

import { useState, useEffect, useCallback } from 'react'
import { getQuotaStatus, subscribeToQuota } from '@/lib/supabase'
import type { QuotaStatus } from '@/lib/types'

interface UseQuotaOptions {
    /** Enable real-time subscription */
    realtime?: boolean
    /** Polling interval in ms (fallback if realtime fails) */
    pollInterval?: number
}

interface UseQuotaReturn {
    quota: QuotaStatus | null
    loading: boolean
    error: string | null
    refresh: () => Promise<void>
}

/**
 * Hook for tracking voucher quota in real-time
 */
export function useQuota(options: UseQuotaOptions = {}): UseQuotaReturn {
    const { realtime = true, pollInterval = 5000 } = options

    const [quota, setQuota] = useState<QuotaStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchQuota = useCallback(async () => {
        try {
            const status = await getQuotaStatus()
            setQuota(status)
            setError(null)
        } catch (err) {
            console.error('Failed to fetch quota:', err)
            setError('Gagal memuat kuota')
        } finally {
            setLoading(false)
        }
    }, [])

    // Initial fetch
    useEffect(() => {
        fetchQuota()
    }, [fetchQuota])

    // Real-time subscription
    useEffect(() => {
        if (!realtime) return

        const unsubscribe = subscribeToQuota((newQuota) => {
            setQuota(newQuota)
        })

        return () => {
            unsubscribe()
        }
    }, [realtime])

    // Polling fallback
    useEffect(() => {
        if (realtime || !pollInterval) return

        const interval = setInterval(fetchQuota, pollInterval)
        return () => clearInterval(interval)
    }, [realtime, pollInterval, fetchQuota])

    return {
        quota,
        loading,
        error,
        refresh: fetchQuota,
    }
}

export default useQuota