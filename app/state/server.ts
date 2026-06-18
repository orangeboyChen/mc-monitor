// Server-only helpers for resolving the user's preferred locale and theme
// from cookies / Accept-Language. Imported by `app/layout.tsx`.

import { cookies, headers } from 'next/headers'
import {
    detectLocale,
    SUPPORTED_LOCALES,
    type Locale,
    type LocalePreference,
} from '@/app/i18n/messages'
import { LOCALE_COOKIE_KEY, THEME_COOKIE_KEY, type Theme } from '@/app/state/keys'

// The persisted preference: a concrete locale if the cookie is set, otherwise
// `auto` (no explicit choice -> follow Accept-Language / the browser).
export const resolveLocalePreference = async (): Promise<LocalePreference> => {
    const cookieStore = await cookies()
    const cookieLocale = cookieStore.get(LOCALE_COOKIE_KEY)?.value
    if (cookieLocale && (SUPPORTED_LOCALES as readonly string[]).includes(cookieLocale)) {
        return cookieLocale as Locale
    }
    return 'auto'
}

export const resolveLocale = async (): Promise<Locale> => {
    const preference = await resolveLocalePreference()
    if (preference !== 'auto') {
        return preference
    }
    const headerStore = await headers()
    const acceptLanguage = headerStore.get('accept-language')
    return detectLocale(acceptLanguage)
}

export const resolveTheme = async (): Promise<Theme> => {
    const cookieStore = await cookies()
    const cookieTheme = cookieStore.get(THEME_COOKIE_KEY)?.value
    if (cookieTheme === 'light' || cookieTheme === 'dark') {
        return cookieTheme
    }
    return 'dark'
}
