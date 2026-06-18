'use client'

import { FC } from 'react'
import clsx from 'clsx'
import { useI18n, useTheme } from '@/app/state/hooks'

export interface ThemeSwitchProps {
    className?: string
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className }) => {
    const { theme, toggle } = useTheme()
    const { t } = useI18n()

    // Theme is hydrated from a cookie on the server (and reflected on
    // <html class>) so the very first render is already correct - no
    // moon -> sun flicker.
    const isLight = theme === 'light'

    return (
        <button
            type='button'
            onClick={toggle}
            aria-label={isLight ? t.nav.themeDark : t.nav.themeLight}
            className={clsx(
                'flex items-center justify-center rounded-lg px-2 pt-px',
                'text-muted transition-opacity hover:opacity-80 cursor-pointer',
                className
            )}
        >
            <span className='text-base leading-none' aria-hidden>
                {isLight ? '☀️' : '🌙'}
            </span>
        </button>
    )
}
