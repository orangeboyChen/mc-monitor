'use client'

import React, { useMemo, useState } from 'react'
import { Card, CardBody, CardHeader } from '@nextui-org/card'
import { Divider } from '@nextui-org/divider'
import { Input } from '@nextui-org/input'
import { Button } from '@nextui-org/button'
import { useMetrics } from '@/app/lib/use-metrics'
import { useI18n } from '@/app/state/hooks'
import { BarList, BarDatum } from '@/components/charts/bar-list'
import { fetchModMetrics } from '@/app/actions/metrics'

const TOP_N = 20

const STORAGE_METRIC = 'minecraft_create_storage_item_count'

interface Row {
    itemId: string
    itemName: string
    network: string
    amount: number
}

export const StoragePanel = () => {
    const { t } = useI18n()
    const { families, error, loading, fetchedAt, reload } = useMetrics(
        fetchModMetrics,
        15_000
    )
    const [search, setSearch] = useState('')

    const rows = useMemo<Row[]>(() => {
        if (!families) return []
        const fam = families.find((f) => f.name === STORAGE_METRIC)
        if (!fam) return []
        return fam.samples.map((s) => ({
            itemId: s.labels.item_id ?? '',
            itemName: s.labels.item_name ?? s.labels.item_id ?? '',
            network: s.labels.network ?? '',
            amount: s.value,
        }))
    }, [families])

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        const list = q
            ? rows.filter(
                  (r) =>
                      r.itemId.toLowerCase().includes(q) ||
                      r.itemName.toLowerCase().includes(q)
              )
            : rows
        return [...list].sort((a, b) => b.amount - a.amount)
    }, [rows, search])

    const topN: BarDatum[] = useMemo(
        () =>
            filtered.slice(0, TOP_N).map((r) => ({
                label: r.itemName || r.itemId,
                value: r.amount,
                sub: r.network ? `network: ${r.network.slice(0, 8)}…` : undefined,
            })),
        [filtered]
    )

    return (
        <Card className='h-full' shadow='sm'>
            <CardHeader className='flex items-center justify-between gap-3 flex-wrap'>
                <div className='flex flex-col'>
                    <p className='text-sm text-default-500'>{t.storage.title}</p>
                    <p className='text-[10px] text-default-400'>
                        {t.storage.totalItems(rows.length)}
                        {fetchedAt
                            ? ` · ${t.common.lastUpdated(new Date(fetchedAt).toLocaleTimeString())}`
                            : ''}
                    </p>
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
            <CardBody className='gap-4'>
                <Input
                    size='sm'
                    placeholder={t.storage.searchPlaceholder}
                    value={search}
                    onValueChange={setSearch}
                    isClearable
                    onClear={() => setSearch('')}
                />

                {error ? (
                    <p className='text-danger text-sm'>
                        {t.metrics.errorLoading}: {error}
                    </p>
                ) : (
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0'>
                        <div className='min-w-0'>
                            <p className='text-xs text-default-500 mb-2'>
                                {t.storage.topNTitle(Math.min(TOP_N, filtered.length))}
                            </p>
                            <BarList
                                data={topN}
                                emptyText={t.storage.noData}
                            />
                        </div>

                        <div className='max-h-[420px] overflow-auto rounded-medium border border-default-100 min-w-0'>
                            <table className='w-full text-xs'>
                                <thead className='sticky top-0 bg-content1 text-default-500'>
                                    <tr>
                                        <th className='text-left p-2'>{t.storage.item}</th>
                                        <th className='text-right p-2'>{t.storage.amount}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={2}
                                                className='text-center text-default-400 p-6'
                                            >
                                                {t.storage.noData}
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((r, i) => (
                                            <tr
                                                key={`${r.network}-${r.itemId}-${i}`}
                                                className='border-b border-default-100 last:border-b-0'
                                            >
                                                <td className='p-2'>
                                                    <div className='flex flex-col'>
                                                        <span className='text-foreground'>
                                                            {r.itemName || r.itemId}
                                                        </span>
                                                        <span className='font-mono text-[10px] text-default-400'>
                                                            {r.itemId}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className='p-2 text-right font-mono'>
                                                    {r.amount.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </CardBody>
        </Card>
    )
}
