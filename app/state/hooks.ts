'use client'

// Client-side hooks that wrap the jotai atoms.
//
// `useI18n` keeps the same shape the codebase used before the migration so
// existing call sites don't have to change. `useTheme` replaces the
// `next-themes` dependency with a tiny atom-backed implementation.

import { useAtom, useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { localeAtom, localePreferenceAtom, messagesAtom, themeAtom } from '@/app/state/atoms'
import {
    detectLocale,
    type Locale,
    type LocalePreference,
    type Messages,
} from '@/app/i18n/messages'
import {
    COOKIE_MAX_AGE_SECONDS,
    LOCALE_COOKIE_KEY,
    THEME_COOKIE_KEY,
    type Theme,
} from '@/app/state/keys'

const writeCookie = (key: string, value: string): void => {
    try {
        document.cookie = `${key}=${value}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
    } catch {
        // ignore (e.g. SSR or disabled cookies)
    }
}

const deleteCookie = (key: string): void => {
    try {
        document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`
    } catch {
        // ignore (e.g. SSR or disabled cookies)
    }
}

// Best-effort detection of the language the browser would use when no explicit
// choice is stored (mirrors the server's Accept-Language handling).
const detectBrowserLocale = (): Locale => {
    if (typeof navigator === 'undefined') return 'zh'
    return detectLocale(navigator.language)
}

interface I18n {
    locale: Locale
    preference: LocalePreference
    setLocale: (l: Locale) => void
    setPreference: (p: LocalePreference) => void
    t: Messages
}

export const useI18n = (): I18n => {
    const [locale, setLocaleAtom] = useAtom(localeAtom)
    const [preference, setPreferenceAtom] = useAtom(localePreferenceAtom)
    const t = useAtomValue(messagesAtom)

    const applyLocale = useCallback(
        (l: Locale) => {
            setLocaleAtom(l)
            if (typeof document !== 'undefined') {
                document.documentElement.lang = l
            }
        },
        [setLocaleAtom],
    )

    const setPreference = useCallback(
        (p: LocalePreference) => {
            setPreferenceAtom(p)
            if (p === 'auto') {
                // Forget the explicit choice; fall back to the browser language.
                deleteCookie(LOCALE_COOKIE_KEY)
                applyLocale(detectBrowserLocale())
            } else {
                writeCookie(LOCALE_COOKIE_KEY, p)
                applyLocale(p)
            }
        },
        [setPreferenceAtom, applyLocale],
    )

    const setLocale = useCallback((l: Locale) => setPreference(l), [setPreference])

    return { locale, preference, setLocale, setPreference, t }
}

interface ThemeApi {
    theme: Theme
    setTheme: (t: Theme) => void
    toggle: () => void
}

export const useTheme = (): ThemeApi => {
    const [theme, setThemeAtom] = useAtom(themeAtom)

    const setTheme = useCallback(
        (next: Theme) => {
            setThemeAtom(next)
            writeCookie(THEME_COOKIE_KEY, next)
            if (typeof document !== 'undefined') {
                const root = document.documentElement
                root.classList.remove('light', 'dark')
                root.classList.add(next)
                root.style.colorScheme = next
            }
        },
        [setThemeAtom],
    )

    const toggle = useCallback(() => {
        setTheme(theme === 'light' ? 'dark' : 'light')
    }, [theme, setTheme])

    return { theme, setTheme, toggle }
}
