'use client'

import React from 'react'
import { Card, CardBody, CardHeader } from '@nextui-org/card'
import { Divider } from '@nextui-org/divider'
import { Chip } from '@nextui-org/chip'
import { useI18n } from '@/app/state/hooks'
import type { MinecraftInfoResponse } from '@/app/action'

interface Props {
    data: MinecraftInfoResponse
}

export const ServerStatusCard = ({ data }: Props) => {
    const { t } = useI18n()
    const offline = data.state === 'unavailable'
    const count = data.online.length

    return (
        <Card className='h-full' shadow='sm'>
            <CardHeader className='flex items-center justify-between gap-3'>
                <div className='flex flex-col'>
                    <p className='text-sm text-default-500'>{t.server.sectionTitle}</p>
                    <p className='text-lg font-semibold'>
                        {offline ? t.server.offline : t.server.online}
                    </p>
                </div>
                <Chip
                    size='sm'
                    color={offline ? 'danger' : count > 0 ? 'success' : 'warning'}
                    variant='flat'
                >
                    {offline ? '●' : t.server.playersOnline(count)}
                </Chip>
            </CardHeader>
            <Divider />
            <CardBody className='gap-2'>
                {offline ? (
                    <p className='text-sm text-default-500'>—</p>
                ) : count === 0 ? (
                    <p className='text-sm text-default-500'>{t.server.nobodyOnline}</p>
                ) : (
                    <div className='flex flex-wrap gap-2'>
                        {data.online.map((nick, i) => (
                            <Chip
                                key={`${nick}-${i}`}
                                size='sm'
                                variant='flat'
                                className='font-mono'
                            >
                                {nick}
                            </Chip>
                        ))}
                    </div>
                )}
            </CardBody>
        </Card>
    )
}
