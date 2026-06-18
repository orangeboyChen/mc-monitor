'use client'

import React from 'react'
import { Card, CardBody, CardHeader } from '@nextui-org/card'
import { Divider } from '@nextui-org/divider'
import { Link } from '@nextui-org/link'
import { useI18n } from '@/app/state/hooks'
import type { MinecraftInfo } from '@/app/action'

interface Props {
    info: MinecraftInfo
}

export const InfoCard = ({ info }: Props) => {
    const { t } = useI18n()

    return (
        <Card className='h-full' shadow='sm'>
            <CardHeader className='flex flex-col items-start gap-1'>
                <p className='text-sm text-default-500'>{t.info.sectionTitle}</p>
                <div className='flex items-baseline gap-2'>
                    <p className='text-lg font-semibold'>Minecraft</p>
                    <p className='text-sm text-default-500 font-mono'>{info.version}</p>
                </div>
            </CardHeader>
            <Divider />
            <CardBody className='gap-3'>
                <div className='flex items-start justify-between gap-3 flex-wrap'>
                    <div className='flex flex-col min-w-0'>
                        <p className='text-sm font-medium'>{t.info.forge}</p>
                        <p className='text-xs text-default-500 font-mono break-all'>
                            {info.forge.version}
                        </p>
                    </div>
                    <Link
                        isBlock
                        showAnchorIcon
                        size='sm'
                        target='_blank'
                        href={info.forge.downloadUrl}
                        className='max-w-full break-words'
                    >
                        {t.info.forgeDownload}
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
                        isBlock
                        showAnchorIcon
                        size='sm'
                        target='_blank'
                        href={info.mod.downloadUrl}
                        className='max-w-full break-words'
                    >
                        <div className='text-right'>
                            <p>{t.info.modDownload}</p>
                            {info.mod.downloadTip ? (
                                <p className='text-[10px] text-default-400'>
                                    {info.mod.downloadTip}
                                </p>
                            ) : null}
                        </div>
                    </Link>
                </div>
            </CardBody>
        </Card>
    )
}
