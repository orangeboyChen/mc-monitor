'use client'

import NextLink from 'next/link'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitch } from '@/components/language-switch'
import { useI18n } from '@/app/state/hooks'

export const Navbar = () => {
	const { t } = useI18n()

	return (
		<header className='sticky top-0 z-40 w-full border-b border-default-300 bg-background/70 backdrop-blur-lg backdrop-saturate-150'>
			<nav className='container mx-auto max-w-7xl flex h-14 items-center justify-between gap-2 px-3 sm:px-6'>
				<NextLink className='flex items-center gap-2 min-w-0 max-w-full' href='/'>
					<span className='font-bold text-foreground truncate'>
						{t.nav.title}
					</span>
				</NextLink>

				<div className='flex items-center gap-0 sm:gap-2 shrink-0'>
					<LanguageSwitch />
					<ThemeSwitch />
				</div>
			</nav>
		</header>
	)
}
