'use client'

import React, { useMemo } from 'react'
import { Button, Card, Chip, Separator } from '@heroui/react'
import { useMetrics } from '@/app/lib/use-metrics'
import { useI18n } from '@/app/state/hooks'
import { BarList, BarDatum } from '@/components/charts/bar-list'
import type { MetricFamily, Sample } from '@/app/lib/prom-parser'
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

/** How many bars to show per metric before truncating. */
const TOP_N = 8

const formatNumber = (v: number): string => {
    if (Number.isNaN(v)) return 'NaN'
    if (!Number.isFinite(v)) return v > 0 ? '+∞' : '-∞'
    if (Math.abs(v) >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}G`
    if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`
    if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(2)}k`
    if (Number.isInteger(v)) return String(v)
    return v.toFixed(3)
}

// Labels that carry no value for an end user — drop them entirely.
const HIDDEN_LABELS = new Set(['__name__', 'instance', 'job', 'item_id'])

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const titleCase = (s: string): string =>
    s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

/** Turn a raw label value into something readable. */
const humanizeValue = (key: string, value: string): string => {
    // Already human-friendly fields stay untouched.
    if (key === 'item_name') return value
    // Collapse long UUIDs / Create network ids to a short prefix.
    if (UUID_RE.test(value)) return value.slice(0, 8)
    // Drop namespace prefixes like create:andesite_alloy -> andesite_alloy.
    const colon = value.indexOf(':')
    const bare = colon >= 0 ? value.slice(colon + 1) : value
    return titleCase(bare)
}

/** Build a clean, key-less label out of the remaining labels of a sample. */
const cleanLabel = (sample: Sample): string => {
    const parts = Object.keys(sample.labels)
        .filter((k) => !HIDDEN_LABELS.has(k))
        .map((k) => humanizeValue(k, sample.labels[k]))
        .filter((v) => v.length > 0)
    return parts.join(' · ')
}

/** Pretty heading for a metric family name. */
const prettyMetricName = (name: string): string =>
    titleCase(
        name
            .replace(/^minecraft_stat_/, '')
            .replace(/^minecraft_create_/, 'create ')
            .replace(/^minecraft_/, '')
    )

interface FamilyView {
    name: string
    title: string
    type: string
    help?: string
    total: number
    bars: BarDatum[]
}

const summarizeFamily = (family: MetricFamily): FamilyView => {
    const sorted = [...family.samples].sort((a, b) => b.value - a.value)
    const bars: BarDatum[] = sorted.slice(0, TOP_N).map((s) => ({
        label: cleanLabel(s) || prettyMetricName(family.name),
        value: s.value,
    }))
    return {
        name: family.name,
        title: prettyMetricName(family.name),
        type: family.type,
        help: family.help,
        total: family.samples.length,
        bars,
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
        <Card className='h-full'>
            <Card.Header className='flex flex-row items-center justify-between gap-3'>
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
                    variant='secondary'
                    onPress={reload}
                    isDisabled={loading}
                >
                    {loading ? t.metrics.loading : t.common.refresh}
                </Button>
            </Card.Header>
            <Separator />
            <Card.Content className='flex flex-col gap-5 max-h-[480px] overflow-auto'>
                {error ? (
                    <p className='text-danger text-sm'>
                        {t.metrics.errorLoading}: {error}
                    </p>
                ) : filtered.length === 0 && !loading ? (
                    <p className='text-default-500 text-sm'>{t.metrics.empty}</p>
                ) : (
                    filtered.map((f) => (
                        <div key={f.name} className='flex flex-col gap-2 min-w-0'>
                            <div className='flex items-baseline gap-2 flex-wrap'>
                                <span className='text-sm font-medium text-foreground'>
                                    {f.title}
                                </span>
                                <Chip size='sm' variant='soft' className='text-[10px]'>
                                    {f.type === 'counter'
                                        ? t.metrics.counter
                                        : f.type === 'gauge'
                                          ? t.metrics.gauge
                                          : f.type}
                                </Chip>
                                {f.total > TOP_N ? (
                                    <span className='text-[10px] text-default-400'>
                                        {t.metrics.topOf(TOP_N, f.total)}
                                    </span>
                                ) : null}
                            </div>
                            {f.help ? (
                                <p className='text-[10px] text-default-400 -mt-1'>
                                    {f.help}
                                </p>
                            ) : null}
                            <BarList
                                data={f.bars}
                                max={TOP_N}
                                formatValue={formatNumber}
                                emptyText={t.metrics.empty}
                            />
                        </div>
                    ))
                )}
            </Card.Content>
        </Card>
    )
}
