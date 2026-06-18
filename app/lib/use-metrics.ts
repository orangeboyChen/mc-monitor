'use client'

import { startTransition, useEffect, useRef, useState } from 'react'
import type { MetricFamily } from '@/app/lib/prom-parser'
import type { MetricsResult } from '@/app/actions/metrics'

export interface UseMetricsResult {
    families: MetricFamily[] | null
    error: string | null
    loading: boolean
    fetchedAt: number | null
    reload: () => void
}

const useMetrics = (
    action: () => Promise<MetricsResult>,
    intervalMs = 30_000
): UseMetricsResult => {
    const [families, setFamilies] = useState<MetricFamily[] | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [fetchedAt, setFetchedAt] = useState<number | null>(null)
    const tokenRef = useRef(0)
    const actionRef = useRef(action)
    actionRef.current = action

    const load = async (): Promise<void> => {
        const myToken = ++tokenRef.current
        setLoading(true)
        try {
            const result = await actionRef.current()
            if (myToken !== tokenRef.current) return
            startTransition(() => {
                if ('error' in result) {
                    setFamilies(null)
                    setError(result.error)
                } else {
                    setFamilies(result.families)
                    setFetchedAt(result.fetchedAt)
                    setError(null)
                }
            })
        } catch (e) {
            if (myToken !== tokenRef.current) return
            startTransition(() => {
                setFamilies(null)
                setError((e as Error).message)
            })
        } finally {
            if (myToken === tokenRef.current) setLoading(false)
        }
    }

    useEffect(() => {
        void load()
        if (intervalMs > 0) {
            const timer = setInterval(() => {
                void load()
            }, intervalMs)
            return () => clearInterval(timer)
        }
        return undefined
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [intervalMs])

    return { families, error, loading, fetchedAt, reload: () => void load() }
}

export { useMetrics }
