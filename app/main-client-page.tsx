'use client'

import React, { startTransition, useEffect, useState } from 'react'
import getMinecraftInfo, { MinecraftInfoResponse } from '@/app/action'
import { fetchExporterMetrics, fetchModMetrics } from '@/app/actions/metrics'
import { useI18n } from '@/app/state/hooks'
import { ServerStatusCard } from '@/components/dashboard/server-status-card'
import { InfoCard } from '@/components/dashboard/info-card'
import { MetricsPanel } from '@/components/dashboard/metrics-panel'
import { StoragePanel } from '@/components/dashboard/storage-panel'
import { HistoryPanel } from '@/components/dashboard/history-panel'

export interface DashboardFlags {
    hasInfoFile: boolean
    hasExporter: boolean
    hasMod: boolean
    hasProm: boolean
}

interface Props {
    initMinecraftInfo: MinecraftInfoResponse | null
    flags: DashboardFlags
}

export const revalidate = 10

const MainClientPage = ({ initMinecraftInfo, flags }: Props) => {
    const { t } = useI18n()
    const [data, setData] = useState(initMinecraftInfo)

    const needsLiveData = flags.hasInfoFile || flags.hasExporter

    useEffect(() => {
        if (!needsLiveData) return
        const timer = setInterval(async () => {
            try {
                const next = await getMinecraftInfo()
                startTransition(() => {
                    setData(next)
                })
            } catch {
                // ignore — UI keeps showing the previous snapshot.
            }
        }, 10_000)
        return () => clearInterval(timer)
    }, [needsLiveData])

    const showStatus = flags.hasExporter && data != null
    const showInfo = flags.hasInfoFile && data != null
    const row1Count = (showStatus ? 1 : 0) + (showInfo ? 1 : 0)
    const row1Cols =
        row1Count >= 2 ? 'md:grid-cols-2' : 'md:grid-cols-1'

    const showExporterMetrics = flags.hasExporter
    const showModMetrics = flags.hasMod
    const row2Count = (showExporterMetrics ? 1 : 0) + (showModMetrics ? 1 : 0)
    const row2Cols =
        row2Count >= 2 ? 'xl:grid-cols-2' : 'xl:grid-cols-1'

    const showStorage = flags.hasMod
    const showHistory = flags.hasProm

    return (
        <div className='flex flex-col gap-4 pb-10'>
            {row1Count > 0 && (
                <div className={`grid grid-cols-1 ${row1Cols} gap-4`}>
                    {showStatus && <ServerStatusCard data={data!} />}
                    {showInfo && <InfoCard info={data!.info} />}
                </div>
            )}

            {row2Count > 0 && (
                <div className={`grid grid-cols-1 ${row2Cols} gap-4`}>
                    {showExporterMetrics && (
                        <MetricsPanel
                            title={t.metrics.exporterTitle}
                            action={fetchExporterMetrics}
                        />
                    )}
                    {showModMetrics && (
                        <MetricsPanel
                            title={t.metrics.modTitle}
                            action={fetchModMetrics}
                        />
                    )}
                </div>
            )}

            {showStorage && <StoragePanel />}

            {showHistory && <HistoryPanel />}
        </div>
    )
}

export default MainClientPage
