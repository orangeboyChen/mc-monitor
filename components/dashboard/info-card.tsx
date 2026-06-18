'use client'

import React from 'react'
import { Card, Link, Separator } from '@heroui/react'
import { useI18n } from '@/app/state/hooks'
import type { MinecraftInfo } from '@/app/action'

interface Props {
    info: MinecraftInfo
}

export const InfoCard = ({ info }: Props) => {
    const { t } = useI18n()

    return (
        <Card className='h-full'>
            <Card.Header className='flex flex-col items-start gap-1'>
                <p className='text-sm text-default-500'>{t.info.sectionTitle}</p>
                <div className='flex items-baseline gap-2'>
                    <p className='text-lg font-semibold'>Minecraft</p>
                    <p className='text-sm text-default-500 font-mono'>{info.version}</p>
                </div>
            </Card.Header>
            <Separator />
            <Card.Content className='flex flex-col gap-3'>
                <div className='flex items-start justify-between gap-3 flex-wrap'>
                    <div className='flex flex-col min-w-0'>
                        <p className='text-sm font-medium'>{t.info.forge}</p>
                        <p className='text-xs text-default-500 font-mono break-all'>
                            {info.forge.version}
                        </p>
                    </div>
                    <Link
                        target='_blank'
                        rel='noopener noreferrer'
                        href={info.forge.downloadUrl}
                        className='text-sm max-w-full break-words'
                    >
                        {t.info.forgeDownload}
                        <Link.Icon />
                    </Link>
                </div>

                <div className='flex items-start justify-between gap-3 flex-wrap'>
                    <div className='flex flex-col min-w-0'>
                        <p className='text-sm font-medium'>{t.info.mod}</p>
                        <p className='text-xs text-default-500 font-mono break-all'>
                            {info.mod.version}
                        </p>
                        <p className='text-[10px] text-default-400'>
                            {t.info.modUpdatedAt(info.mod.updateTime)}
                        </p>
                    </div>
                    <Link
                        target='_blank'
                        rel='noopener noreferrer'
                        href={info.mod.downloadUrl}
                        className='text-sm max-w-full break-words'
                    >
                        <span className='text-right'>
                            <span className='block'>{t.info.modDownload}</span>
                            {info.mod.downloadTip ? (
                                <span className='block text-[10px] text-default-400'>
                                    {info.mod.downloadTip}
                                </span>
                            ) : null}
                        </span>
                        <Link.Icon />
                    </Link>
                </div>
            </Card.Content>
        </Card>
    )
}
