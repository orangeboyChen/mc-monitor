'use client'

import React from 'react'
import { Button, Dropdown, Label } from '@heroui/react'
import type { Selection } from '@heroui/react'
import { useI18n } from '@/app/state/hooks'
import {
    LOCALE_LABEL,
    SUPPORTED_LOCALES,
    type LocalePreference,
} from '@/app/i18n/messages'

export const LanguageSwitch = () => {
    const { locale, preference, setPreference, t } = useI18n()

    const onSelectionChange = (keys: Selection): void => {
        if (keys === 'all') return
        const next = Array.from(keys)[0] as LocalePreference | undefined
        if (next && next !== preference) setPreference(next)
    }

    // The button shows the effective language; when the preference is "auto"
    // we suffix the auto label so the user knows it is being detected.
    const buttonLabel =
        preference === 'auto'
            ? `${t.nav.languageAuto} · ${LOCALE_LABEL[locale]}`
            : LOCALE_LABEL[locale]

    return (
        <Dropdown>
            <Button
                aria-label={t.nav.language}
                variant='ghost'
                size='sm'
                className='min-w-0 px-2 text-muted'
            >
                <span className='text-base'>🌐</span>
                <span className='hidden sm:inline ml-1'>{buttonLabel}</span>
            </Button>
            <Dropdown.Popover placement='bottom end' className='min-w-[160px]'>
                <Dropdown.Menu
                    aria-label={t.nav.language}
                    selectionMode='single'
                    selectedKeys={new Set([preference])}
                    onSelectionChange={onSelectionChange}
                >
                    <Dropdown.Item
                        key='auto'
                        id='auto'
                        textValue={t.nav.languageAuto}
                    >
                        <Dropdown.ItemIndicator />
                        <Label>{t.nav.languageAuto}</Label>
                    </Dropdown.Item>
                    {SUPPORTED_LOCALES.map((l) => (
                        <Dropdown.Item key={l} id={l} textValue={LOCALE_LABEL[l]}>
                            <Dropdown.ItemIndicator />
                            <Label>{LOCALE_LABEL[l]}</Label>
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    )
}
