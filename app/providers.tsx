'use client'

import * as React from 'react'
import {NextUIProvider} from '@nextui-org/system'
import {useRouter} from 'next/navigation'
import {JotaiAppProvider} from '@/app/state/provider'
import type {Locale} from '@/app/i18n/messages'
import type {Theme} from '@/app/state/keys'

export interface ProvidersProps {
    children: React.ReactNode
    initialLocale: Locale
    initialTheme: Theme
}

export const Providers = ({children, initialLocale, initialTheme}: ProvidersProps) => {
    const router = useRouter()

    return (
        <NextUIProvider navigate={router.push}>
            <JotaiAppProvider locale={initialLocale} theme={initialTheme}>
                {children}
            </JotaiAppProvider>
        </NextUIProvider>
    )
}
