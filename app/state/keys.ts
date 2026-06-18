// Shared cookie/storage keys. Plain constants so they can be safely imported
// from both Server Components and Client Components without any runtime cost.

export const LOCALE_COOKIE_KEY = 'mc-monitor.locale'
export const THEME_COOKIE_KEY = 'mc-monitor.theme'

export const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

export type Theme = 'light' | 'dark'
