'use client'

import React, { useMemo, useState } from 'react'

export interface LineSeries {
    name: string
    points: Array<{ t: number; v: number }>
}

interface Props {
    series: LineSeries[]
    /** Width is responsive via viewBox, but height is fixed pixels. */
    height?: number
    /** Optional value formatter for the tooltip + Y-axis labels. */
    formatValue?: (v: number) => string
    /** Optional time formatter for tooltip. Defaults to local HH:mm. */
    formatTime?: (sec: number) => string
    emptyText?: string
}

const SERIES_COLORS = [
    'var(--accent)',
    'var(--success)',
    'var(--warning)',
    'var(--muted)',
    'var(--danger)',
]

const defaultFormatValue = (v: number): string => {
    if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
    if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}k`
    if (Number.isInteger(v)) return String(v)
    return v.toFixed(2)
}

const defaultFormatTime = (sec: number): string => {
    const d = new Date(sec * 1000)
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${hh}:${mm}`
}

/**
 * Lightweight responsive multi-series line chart implemented with raw SVG.
 * Adapts to light/dark via NextUI CSS variables (no recharts/echarts).
 */
export const LineChart = ({
    series,
    height = 220,
    formatValue = defaultFormatValue,
    formatTime = defaultFormatTime,
    emptyText,
}: Props) => {
    const [hoverIdx, setHoverIdx] = useState<number | null>(null)

    const { width, paddingLeft, paddingRight, paddingTop, paddingBottom } = {
        width: 600,
        paddingLeft: 44,
        paddingRight: 12,
        paddingTop: 12,
        paddingBottom: 24,
    }

    const flatPoints = useMemo(() => series.flatMap((s) => s.points), [series])

    const { tMin, tMax, vMin, vMax } = useMemo(() => {
        if (flatPoints.length === 0) {
            return { tMin: 0, tMax: 1, vMin: 0, vMax: 1 }
        }
        let _tMin = Infinity
        let _tMax = -Infinity
        let _vMin = Infinity
        let _vMax = -Infinity
        for (const p of flatPoints) {
            if (p.t < _tMin) _tMin = p.t
            if (p.t > _tMax) _tMax = p.t
            if (p.v < _vMin) _vMin = p.v
            if (p.v > _vMax) _vMax = p.v
        }
        if (_vMin === _vMax) {
            _vMin -= 1
            _vMax += 1
        }
        return { tMin: _tMin, tMax: _tMax, vMin: _vMin, vMax: _vMax }
    }, [flatPoints])

    const innerW = width - paddingLeft - paddingRight
    const innerH = height - paddingTop - paddingBottom

    const xOf = (t: number): number =>
        paddingLeft + ((t - tMin) / Math.max(1, tMax - tMin)) * innerW
    const yOf = (v: number): number =>
        paddingTop + (1 - (v - vMin) / Math.max(1e-9, vMax - vMin)) * innerH

    if (flatPoints.length === 0) {
        return (
            <div
                className='flex items-center justify-center text-default-500 text-sm'
                style={{ height }}
            >
                {emptyText ?? 'No data'}
            </div>
        )
    }

    // Build a list of unique x-positions for cursor snapping.
    const xTicks: number[] = []
    const longestSeries = series.reduce((acc, s) =>
        s.points.length > acc.points.length ? s : acc
    , series[0])
    longestSeries.points.forEach((p) => xTicks.push(p.t))

    const yTicks = 4
    const yTickValues: number[] = []
    for (let i = 0; i <= yTicks; i += 1) {
        yTickValues.push(vMin + ((vMax - vMin) * i) / yTicks)
    }

    const handleMove = (e: React.MouseEvent<SVGSVGElement>): void => {
        const svg = e.currentTarget
        const rect = svg.getBoundingClientRect()
        const ratio = (e.clientX - rect.left) / rect.width
        const xInSvg = ratio * width
        // Find nearest tick.
        let bestIdx = 0
        let bestDist = Infinity
        for (let i = 0; i < xTicks.length; i += 1) {
            const dist = Math.abs(xOf(xTicks[i]) - xInSvg)
            if (dist < bestDist) {
                bestDist = dist
                bestIdx = i
            }
        }
        setHoverIdx(bestIdx)
    }

    const hoverT = hoverIdx != null ? xTicks[hoverIdx] : null

    return (
        <div className='relative w-full'>
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className='w-full h-auto select-none'
                role='img'
                onMouseMove={handleMove}
                onMouseLeave={() => setHoverIdx(null)}
            >
                {/* Grid + Y axis labels */}
                {yTickValues.map((tv, i) => {
                    const y = yOf(tv)
                    return (
                        <g key={i}>
                            <line
                                x1={paddingLeft}
                                x2={width - paddingRight}
                                y1={y}
                                y2={y}
                                className='stroke-default-200'
                                strokeDasharray='2 4'
                                strokeWidth={1}
                            />
                            <text
                                x={paddingLeft - 6}
                                y={y + 3}
                                textAnchor='end'
                                className='fill-default-500'
                                fontSize='10'
                            >
                                {formatValue(tv)}
                            </text>
                        </g>
                    )
                })}

                {/* X axis labels (start, mid, end) */}
                {[tMin, (tMin + tMax) / 2, tMax].map((t, i) => (
                    <text
                        key={i}
                        x={xOf(t)}
                        y={height - 6}
                        textAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'}
                        className='fill-default-500'
                        fontSize='10'
                    >
                        {formatTime(t)}
                    </text>
                ))}

                {/* Series lines */}
                {series.map((s, si) => {
                    if (s.points.length === 0) return null
                    const d = s.points
                        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xOf(p.t)} ${yOf(p.v)}`)
                        .join(' ')
                    return (
                        <path
                            key={s.name}
                            d={d}
                            fill='none'
                            stroke={SERIES_COLORS[si % SERIES_COLORS.length]}
                            strokeWidth={1.5}
                            strokeLinejoin='round'
                            strokeLinecap='round'
                        />
                    )
                })}

                {/* Hover cursor */}
                {hoverT != null ? (
                    <line
                        x1={xOf(hoverT)}
                        x2={xOf(hoverT)}
                        y1={paddingTop}
                        y2={height - paddingBottom}
                        className='stroke-default-400'
                        strokeWidth={1}
                    />
                ) : null}

                {/* Hover dots */}
                {hoverT != null
                    ? series.map((s, si) => {
                          const p = s.points.find((pp) => pp.t === hoverT)
                          if (!p) return null
                          return (
                              <circle
                                  key={s.name}
                                  cx={xOf(p.t)}
                                  cy={yOf(p.v)}
                                  r={3}
                                  fill={SERIES_COLORS[si % SERIES_COLORS.length]}
                              />
                          )
                      })
                    : null}
            </svg>

            {/* Legend + tooltip */}
            <div className='mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-default-500'>
                {series.map((s, si) => {
                    const hovered =
                        hoverT != null
                            ? s.points.find((p) => p.t === hoverT)?.v
                            : undefined
                    return (
                        <span key={s.name} className='flex items-center gap-1'>
                            <span
                                className='inline-block w-2.5 h-2.5 rounded-full'
                                style={{
                                    background: SERIES_COLORS[si % SERIES_COLORS.length],
                                }}
                            />
                            <span className='text-foreground'>{s.name}</span>
                            {hovered !== undefined ? (
                                <span className='font-mono'>{formatValue(hovered)}</span>
                            ) : null}
                        </span>
                    )
                })}
                {hoverT != null ? (
                    <span className='ml-auto font-mono'>{formatTime(hoverT)}</span>
                ) : null}
            </div>
        </div>
    )
}
