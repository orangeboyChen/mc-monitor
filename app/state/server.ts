// Server-only helpers for resolving the user's preferred locale and theme
// from cookies / Accept-Language. Imported by `app/layout.tsx`.

import { cookies, headers } from 'next/headers'
import { detectLocale, SUPPORTED_LOCALES, type Locale } from '@/app/i18n/messages'
import { LOCALE_COOKIE_KEY, THEME_COOKIE_KEY, type Theme } from '@/app/state/keys'

export const resolveLocale = (): Locale => {
    const cookieLocale = cookies().get(LOCALE_COOKIE_KEY)?.value
    if (cookieLocale && (SUPPORTED_LOCALES as readonly string[]).includes(cookieLocale)) {
        return cookieLocale as Locale
    }
    const acceptLanguage = headers().get('accept-language')
    return detectLocale(acceptLanguage)
}

export const resolveTheme = (): Theme => {
    const cookieTheme = cookies().get(THEME_COOKIE_KEY)?.value
    if (cookieTheme === 'light' || cookieTheme === 'dark') {
        return cookieTheme
    }
    return 'dark'
}
