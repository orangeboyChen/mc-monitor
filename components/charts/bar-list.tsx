'use client'

import React, { useMemo } from 'react'

export interface BarDatum {
    label: string
    value: number
    /** Optional secondary line under the label */
    sub?: string
}

interface Props {
    data: BarDatum[]
    /** Max bars to display (truncates from the end). */
    max?: number
    /** Format the value displayed at the end of each bar. */
    formatValue?: (v: number) => string
    /** Optional className for the outer container. */
    className?: string
    emptyText?: string
}

const defaultFormat = (v: number): string => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`
    return String(Math.round(v))
}

/**
 * Pure-CSS horizontal bar chart. Tailwind + NextUI semantic colors only,
 * so it adapts to light/dark themes automatically. Fully responsive — the
 * bars fill the container width.
 */
export const BarList = ({
    data,
    max = 20,
    formatValue = defaultFormat,
    className,
    emptyText,
}: Props) => {
    const sliced = useMemo(() => data.slice(0, max), [data, max])
    const peak = useMemo(
        () => sliced.reduce((acc, d) => Math.max(acc, d.value), 0),
        [sliced]
    )

    if (sliced.length === 0) {
        return (
            <p className='text-default-500 text-sm py-6 text-center'>
                {emptyText ?? 'No data'}
            </p>
        )
    }

    return (
        <div className={['flex flex-col gap-2', className ?? ''].join(' ')}>
            {sliced.map((d, i) => {
                const pct = peak > 0 ? Math.max(2, (d.value / peak) * 100) : 0
                return (
                    <div key={`${d.label}-${i}`} className='group'>
                        <div className='flex items-baseline justify-between gap-3 text-xs mb-1'>
                            <span className='truncate text-foreground'>{d.label}</span>
                            <span className='shrink-0 font-mono text-default-500'>
                                {formatValue(d.value)}
                            </span>
                        </div>
                        <div className='h-2 w-full rounded-full bg-default-100 overflow-hidden'>
                            <div
                                className='h-full rounded-full bg-primary'
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        {d.sub ? (
                            <span className='text-[10px] text-default-400'>{d.sub}</span>
                        ) : null}
                    </div>
                )
            })}
        </div>
    )
}
