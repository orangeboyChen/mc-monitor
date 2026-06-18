'use client'

// Jotai store + SSR hydration. The server passes the cookie-resolved
// `locale` and `theme` down once; `useHydrateAtoms` writes them into the
// store before the first client render so there's no hydration mismatch
// and no post-mount flicker (moon -> sun, zh -> en, ...).

import { Provider, createStore } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { useState, type ReactNode } from 'react'
import { localeAtom, themeAtom } from '@/app/state/atoms'
import type { Locale } from '@/app/i18n/messages'
import type { Theme } from '@/app/state/keys'

interface HydrateProps {
    locale: Locale
    theme: Theme
    children: ReactNode
}

const HydrateAtoms = ({ locale, theme, children }: HydrateProps) => {
    useHydrateAtoms([
        [localeAtom, locale],
        [themeAtom, theme],
    ])
    return <>{children}</>
}

interface JotaiAppProviderProps {
    locale: Locale
    theme: Theme
    children: ReactNode
}

export const JotaiAppProvider = ({ locale, theme, children }: JotaiAppProviderProps) => {
    // One store per browser tab. `useState` ensures the same store survives
    // re-renders without being recreated.
    const [store] = useState(() => createStore())
    return (
        <Provider store={store}>
            <HydrateAtoms locale={locale} theme={theme}>
                {children}
            </HydrateAtoms>
        </Provider>
    )
}
