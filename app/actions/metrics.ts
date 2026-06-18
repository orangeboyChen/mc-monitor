'use server'

import { parsePrometheusText, MetricFamily } from '@/app/lib/prom-parser'

// Hard cap for any upstream call made during SSR / from a server action.
// Anything slower than this is treated as unavailable and degraded gracefully
// so the first paint is never blocked by a slow exporter or Prometheus.
const SSR_FETCH_TIMEOUT_MS = 200

export interface MetricsSnapshot {
    source: 'exporter' | 'mod'
    url: string | null
    fetchedAt: number
    families: MetricFamily[]
}

export interface MetricsError {
    error: string
}

export type MetricsResult = MetricsSnapshot | MetricsError

const fetchPrometheusEndpoint = async (
    source: 'exporter' | 'mod',
    url: string | undefined,
    envName: string
): Promise<MetricsResult> => {
    if (!url) {
        return { error: `${envName} is not set` }
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), SSR_FETCH_TIMEOUT_MS)
    try {
        const res = await fetch(url, { cache: 'no-store', signal: controller.signal })
        if (!res.ok) {
            return { error: `${source} responded ${res.status}` }
        }
        const text = await res.text()
        return {
            source,
            url,
            fetchedAt: Date.now(),
            families: parsePrometheusText(text),
        }
    } catch (e) {
        const err = e as Error
        if (err.name === 'AbortError') {
            return { error: `${source} timed out` }
        }
        return { error: err.message }
    } finally {
        clearTimeout(timer)
    }
}

export const fetchExporterMetrics = async (): Promise<MetricsResult> => {
    return fetchPrometheusEndpoint('exporter', process.env.MC_EXPORTER_URL, 'MC_EXPORTER_URL')
}

export const fetchModMetrics = async (): Promise<MetricsResult> => {
    return fetchPrometheusEndpoint('mod', process.env.MOD_METRICS_URL, 'MOD_METRICS_URL')
}

// -----------------------------------------------------------------------------
// Prometheus query_range
// -----------------------------------------------------------------------------

export type RangeKey = '1h' | '6h' | '24h' | '7d'

export interface RangePoint {
    t: number
    v: number
}

export interface RangeSnapshot {
    series: Array<{
        labels: Record<string, string>
        points: RangePoint[]
    }>
    start: number
    end: number
    step: number
}

export type RangeResult = RangeSnapshot | MetricsError

const RANGE_PRESETS: Record<RangeKey, { seconds: number; step: number }> = {
    '1h': { seconds: 60 * 60, step: 15 },
    '6h': { seconds: 6 * 60 * 60, step: 60 },
    '24h': { seconds: 24 * 60 * 60, step: 5 * 60 },
    '7d': { seconds: 7 * 24 * 60 * 60, step: 30 * 60 },
}

interface PromRangeResponse {
    status: string
    data: {
        resultType: string
        result: Array<{ metric: Record<string, string>; values: Array<[number, string]> }>
    }
    error?: string
}

export const fetchRangeQuery = async (
    query: string,
    rangeKey: RangeKey = '1h'
): Promise<RangeResult> => {
    const promUrl = process.env.PROM_URL
    if (!promUrl) {
        return { error: 'PROM_URL is not set' }
    }
    if (!query) {
        return { error: 'query is required' }
    }

    const preset = RANGE_PRESETS[rangeKey] ?? RANGE_PRESETS['1h']
    const end = Math.floor(Date.now() / 1000)
    const start = end - preset.seconds

    const target = new URL('/api/v1/query_range', promUrl)
    target.searchParams.set('query', query)
    target.searchParams.set('start', String(start))
    target.searchParams.set('end', String(end))
    target.searchParams.set('step', String(preset.step))

    let json: PromRangeResponse
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), SSR_FETCH_TIMEOUT_MS)
    try {
        const res = await fetch(target.toString(), { cache: 'no-store', signal: controller.signal })
        if (!res.ok) {
            return { error: `prometheus responded ${res.status}` }
        }
        json = (await res.json()) as PromRangeResponse
    } catch (e) {
        const err = e as Error
        if (err.name === 'AbortError') {
            return { error: 'prometheus timed out' }
        }
        return { error: err.message }
    } finally {
        clearTimeout(timer)
    }

    if (json.status !== 'success') {
        return { error: json.error ?? 'prometheus error' }
    }

    return {
        series: json.data.result.map((r) => ({
            labels: r.metric,
            points: r.values.map(([t, v]): RangePoint => ({ t, v: Number(v) })),
        })),
        start,
        end,
        step: preset.step,
    }
}
