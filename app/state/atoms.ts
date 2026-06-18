// Jotai atoms for the two pieces of UI state that need to survive a reload
// AND be SSR-rendered: `locale` and `theme`.
//
// Both atoms are *primitive* (so any component can write to them) and a
// derived `messagesAtom` returns the heavy translation dictionary. By
// splitting "the locale string" from "the messages object" we keep
// `selectedKeys`-style controlled selectors snappy while still letting
// translations be deferred / memoised by React if needed.

import { atom } from 'jotai'
import { MESSAGES, type Locale, type Messages } from '@/app/i18n/messages'
import type { Theme } from '@/app/state/keys'

export const localeAtom = atom<Locale>('zh')

export const messagesAtom = atom<Messages>((get) => MESSAGES[get(localeAtom)])

export const themeAtom = atom<Theme>('dark')
