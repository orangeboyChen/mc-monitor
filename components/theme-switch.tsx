'use client'

import { FC } from 'react'
import { VisuallyHidden } from '@react-aria/visually-hidden'
import { SwitchProps, useSwitch } from '@nextui-org/switch'
import clsx from 'clsx'
import { useI18n, useTheme } from '@/app/state/hooks'

export interface ThemeSwitchProps {
    className?: string
    classNames?: SwitchProps['classNames']
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className, classNames }) => {
    const { theme, toggle } = useTheme()
    const { t } = useI18n()

    // Theme is hydrated from a cookie on the server (and reflected on
    // <html class>) so the very first render is already correct - no
    // moon -> sun flicker.
    const isLight = theme === 'light'

    const {
        Component,
        slots,
        isSelected,
        getBaseProps,
        getInputProps,
        getWrapperProps,
    } = useSwitch({
        isSelected: isLight,
        'aria-label': isLight ? t.nav.themeDark : t.nav.themeLight,
        onChange: toggle,
    })

    return (
        <Component
            {...getBaseProps({
                className: clsx(
                    'px-px transition-opacity hover:opacity-80 cursor-pointer',
                    className,
                    classNames?.base
                ),
            })}
        >
            <VisuallyHidden>
                <input {...getInputProps()} />
            </VisuallyHidden>
            <div
                {...getWrapperProps()}
                className={slots.wrapper({
                    class: clsx(
                        [
                            'w-auto h-auto',
                            'bg-transparent',
                            'rounded-lg',
                            'flex items-center justify-center',
                            'group-data-[selected=true]:bg-transparent',
                            'text-default-600',
                            'pt-px',
                            'px-2',
                        ],
                        classNames?.wrapper
                    ),
                })}
            >
                <span className='text-base leading-none' aria-hidden>
                    {isSelected ? '☀️' : '🌙'}
                </span>
            </div>
        </Component>
    )
}
