'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardBody, CardHeader } from '@nextui-org/card'
import { Divider } from '@nextui-org/divider'
import { Button } from '@nextui-org/button'
import { useI18n } from '@/app/state/hooks'
import { LineChart, LineSeries } from '@/components/charts/line-chart'
import { fetchRangeQuery, RangeKey } from '@/app/actions/metrics'

const QUERIES = [
    {
        promql: 'sum(minecraft_player_online)',
        labelKey: 'players',
    },
] as const

interface RangeOption {
    key: RangeKey
    labelKey: 'range1h' | 'range6h' | 'range24h' | 'range7d'
}

const RANGES: RangeOption[] = [
    { key: '1h', labelKey: 'range1h' },
    { key: '6h', labelKey: 'range6h' },
    { key: '24h', labelKey: 'range24h' },
    { key: '7d', labelKey: 'range7d' },
]

export const HistoryPanel = () => {
    const { t } = useI18n()
    const [range, setRange] = useState<RangeKey>('1h')
    const [series, setSeries] = useState<LineSeries[] | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [notConfigured, setNotConfigured] = useState(false)

    useEffect(() => {
        let cancelled = false
        const load = async (): Promise<void> => {
            setLoading(true)
            try {
                const out: LineSeries[] = []
                let anyOk = false
                let configMissing = false
                let lastError: string | null = null
                for (const q of QUERIES) {
                    const result = await fetchRangeQuery(q.promql, range)
                    if (cancelled) return
                    if ('error' in result) {
                        if (result.error === 'PROM_URL is not set') {
                            configMissing = true
                        } else {
                            lastError = result.error
                        }
                        continue
                    }
                    anyOk = true
                    result.series.forEach((s, i) => {
                        out.push({
                            name:
                                result.series.length === 1
                                    ? q.labelKey
                                    : `${q.labelKey}#${i + 1}`,
                            points: s.points,
                        })
                    })
                }
                if (cancelled) return
                if (configMissing && !anyOk) {
                    setNotConfigured(true)
                    setSeries(null)
                    setError(null)
                } else if (anyOk) {
                    setSeries(out)
                    setError(null)
                    setNotConfigured(false)
                } else if (lastError) {
                    setError(lastError)
                }
            } catch (e) {
                if (!cancelled) setError((e as Error).message)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        void load()
        return () => {
            cancelled = true
        }
    }, [range])

    const totalPoints = useMemo(
        () => (series ?? []).reduce((acc, s) => acc + s.points.length, 0),
        [series]
    )

    return (
        <Card className='h-full' shadow='sm'>
            <CardHeader className='flex items-center justify-between gap-3 flex-wrap'>
                <div className='flex flex-col'>
                    <p className='text-sm text-default-500'>{t.history.title}</p>
                    <p className='text-[10px] text-default-400'>{t.history.subtitle}</p>
                </div>
                <div className='flex flex-wrap gap-1'>
                    {RANGES.map((r) => (
                        <Button
                            key={r.key}
                            size='sm'
                            variant={r.key === range ? 'solid' : 'flat'}
                            color={r.key === range ? 'primary' : 'default'}
                            onPress={() => setRange(r.key)}
                            isDisabled={loading}
                        >
                            {t.history[r.labelKey]}
                        </Button>
                    ))}
                </div>
            </CardHeader>
            <Divider />
            <CardBody>
                {notConfigured ? (
                    <p className='text-default-500 text-sm py-8 text-center'>
                        {t.history.notConfigured}
                    </p>
                ) : error ? (
                    <p className='text-danger text-sm'>
                        {t.history.loadFailed}: {error}
                    </p>
                ) : !series || totalPoints === 0 ? (
                    <p className='text-default-500 text-sm py-8 text-center'>
                        {loading ? t.metrics.loading : t.history.noSeries}
                    </p>
                ) : (
                    <LineChart series={series} emptyText={t.history.noSeries} />
                )}
            </CardBody>
        </Card>
    )
}
