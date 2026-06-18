'use client'

import React from 'react'
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/dropdown'
import { Button } from '@nextui-org/button'
import { useI18n } from '@/app/state/hooks'
import { Locale, LOCALE_LABEL, SUPPORTED_LOCALES } from '@/app/i18n/messages'

export const LanguageSwitch = () => {
    const { locale, setLocale, t } = useI18n()

    return (
        <Dropdown placement='bottom-end'>
            <DropdownTrigger>
                <Button
                    aria-label={t.nav.language}
                    variant='light'
                    size='sm'
                    className='min-w-0 px-2 text-default-600'
                >
                    <span className='text-base'>🌐</span>
                    <span className='hidden sm:inline ml-1'>{LOCALE_LABEL[locale]}</span>
                </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label={t.nav.language}>
                {SUPPORTED_LOCALES.map((l) => (
                    <DropdownItem
                        key={l}
                        className={l === locale ? 'text-primary' : undefined}
                        startContent={l === locale ? '✓' : <span className='inline-block w-3' />}
                        onPress={() => {
                            if (l !== locale) setLocale(l)
                        }}
                    >
                        {LOCALE_LABEL[l]}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    )
}
