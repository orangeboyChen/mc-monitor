'use client'

import * as React from 'react'
import {JotaiAppProvider} from '@/app/state/provider'
import type {Locale, LocalePreference} from '@/app/i18n/messages'
import type {Theme} from '@/app/state/keys'

export interface ProvidersProps {
    children: React.ReactNode
    initialLocale: Locale
    initialLocalePreference: LocalePreference
    initialTheme: Theme
}

// HeroUI v3 does not require a provider. We only keep the Jotai app provider
// here to seed the locale/theme atoms resolved on the server.
export const Providers = ({
    children,
    initialLocale,
    initialLocalePreference,
    initialTheme,
}: ProvidersProps) => {
    return (
        <JotaiAppProvider
            locale={initialLocale}
            localePreference={initialLocalePreference}
            theme={initialTheme}
        >
            {children}
        </JotaiAppProvider>
    )
}
