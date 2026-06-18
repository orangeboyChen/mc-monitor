'use client'

import React, { useMemo } from 'react'
import { Card, CardBody, CardHeader } from '@nextui-org/card'
import { Divider } from '@nextui-org/divider'
import { Button } from '@nextui-org/button'
import { Chip } from '@nextui-org/chip'
import { useMetrics } from '@/app/lib/use-metrics'
import { useI18n } from '@/app/state/hooks'
import type { MetricFamily } from '@/app/lib/prom-parser'
import type { MetricsResult } from '@/app/actions/metrics'

interface Props {
    /** Title for the panel header. */
    title: string
    /** Server action returning the metrics snapshot. */
    action: () => Promise<MetricsResult>
    /**
     * Optional filter — only metric names matching this predicate are shown.
     * Useful for hiding histogram buckets and noisy go runtime metrics.
     */
    metricFilter?: (name: string) => boolean
}

const formatNumber = (v: number): string => {
    if (Number.isNaN(v)) return 'NaN'
    if (!Number.isFinite(v)) return v > 0 ? '+∞' : '-∞'
    if (Math.abs(v) >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}G`
    if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`
    if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(2)}k`
    if (Number.isInteger(v)) return String(v)
    return v.toFixed(3)
}

const formatLabels = (labels: Record<string, string>): string => {
    const keys = Object.keys(labels)
    if (keys.length === 0) return ''
    return keys
        .filter((k) => k !== '__name__')
        .map((k) => `${k}=${labels[k]}`)
        .join(', ')
}

const summarizeFamily = (
    family: MetricFamily
): { name: string; type: string; help?: string; rows: Array<{ labels: string; value: number }> } => {
    return {
        name: family.name,
        type: family.type,
        help: family.help,
        rows: family.samples.slice(0, 32).map((s) => ({
            labels: formatLabels(s.labels),
            value: s.value,
        })),
    }
}

const defaultFilter = (name: string): boolean => {
    // Hide go-runtime / process metrics by default; they tend to dominate the
    // panel and aren't interesting to end users.
    if (name.startsWith('go_')) return false
    if (name.startsWith('process_')) return false
    if (name.startsWith('promhttp_')) return false
    return true
}

export const MetricsPanel = ({ title, action, metricFilter = defaultFilter }: Props) => {
    const { t } = useI18n()
    const { families, error, loading, fetchedAt, reload } = useMetrics(action)

    const filtered = useMemo(() => {
        if (!families) return []
        return families
            .filter((f) => metricFilter(f.name))
            .filter((f) => f.samples.length > 0)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(summarizeFamily)
    }, [families, metricFilter])

    return (
        <Card className='h-full' shadow='sm'>
            <CardHeader className='flex items-center justify-between gap-3'>
                <div className='flex flex-col'>
                    <p className='text-sm text-default-500'>{title}</p>
                    {fetchedAt ? (
                        <p className='text-[10px] text-default-400'>
                            {t.common.lastUpdated(new Date(fetchedAt).toLocaleTimeString())}
                        </p>
                    ) : null}
                </div>
                <Button
                    size='sm'
                    variant='flat'
                    onPress={reload}
                    isDisabled={loading}
                >
                    {loading ? t.metrics.loading : t.common.refresh}
                </Button>
            </CardHeader>
            <Divider />
            <CardBody className='gap-3 max-h-[420px] overflow-auto'>
                {error ? (
                    <p className='text-danger text-sm'>
                        {t.metrics.errorLoading}: {error}
                    </p>
                ) : filtered.length === 0 && !loading ? (
                    <p className='text-default-500 text-sm'>{t.metrics.empty}</p>
                ) : (
                    filtered.map((f) => (
                        <div key={f.name} className='flex flex-col gap-1 min-w-0'>
                            <div className='flex items-center gap-2 flex-wrap'>
                                <span className='font-mono text-xs text-foreground break-all'>
                                    {f.name}
                                </span>
                                <Chip size='sm' variant='flat' className='text-[10px]'>
                                    {f.type === 'counter'
                                        ? t.metrics.counter
                                        : f.type === 'gauge'
                                          ? t.metrics.gauge
                                          : f.type}
                                </Chip>
                            </div>
                            {f.help ? (
                                <p className='text-[10px] text-default-400'>{f.help}</p>
                            ) : null}
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-4'>
                                {f.rows.map((r, i) => (
                                    <div
                                        key={i}
                                        className='flex items-center justify-between gap-2 border-b border-default-100 py-0.5'
                                    >
                                        <span className='font-mono text-[10px] text-default-500 truncate'>
                                            {r.labels || '—'}
                                        </span>
                                        <span className='font-mono text-xs shrink-0'>
                                            {formatNumber(r.value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </CardBody>
        </Card>
    )
}
