'use client'

import React from 'react'
import { Card, Chip, Separator } from '@heroui/react'
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
        <Card className='h-full'>
            <Card.Header className='flex flex-row items-center justify-between gap-3'>
                <div className='flex flex-col'>
                    <p className='text-sm text-default-500'>{t.server.sectionTitle}</p>
                    <p className='text-lg font-semibold'>
                        {offline ? t.server.offline : t.server.online}
                    </p>
                </div>
                <Chip
                    size='sm'
                    color={offline ? 'danger' : count > 0 ? 'success' : 'warning'}
                    variant='soft'
                >
                    {offline ? '●' : t.server.playersOnline(count)}
                </Chip>
            </Card.Header>
            <Separator />
            <Card.Content className='flex flex-col gap-2'>
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
                                variant='soft'
                                className='font-mono'
                            >
                                {nick}
                            </Chip>
                        ))}
                    </div>
                )}
            </Card.Content>
        </Card>
    )
}
