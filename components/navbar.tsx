'use client'

import {
	Navbar as NextUINavbar,
	NavbarBrand,
	NavbarContent,
	NavbarItem,
} from '@nextui-org/navbar'
import NextLink from 'next/link'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitch } from '@/components/language-switch'
import { useI18n } from '@/app/state/hooks'

export const Navbar = () => {
	const { t } = useI18n()

	return (
		<NextUINavbar
			maxWidth='xl'
			position='sticky'
			isBordered
			classNames={{ wrapper: 'px-3 sm:px-6 gap-2' }}
		>
			<NavbarContent justify='start' className='basis-auto flex-grow min-w-0'>
				<NavbarBrand as='li' className='gap-2 min-w-0'>
					<NextLink className='flex items-center gap-2 min-w-0 max-w-full' href='/'>
						<span className='font-bold text-foreground truncate hidden sm:inline'>
							{t.nav.title}
						</span>
					</NextLink>
				</NavbarBrand>
			</NavbarContent>

			<NavbarContent
				justify='end'
				className='basis-auto flex-grow-0 gap-0 sm:gap-2 shrink-0'
			>
				<NavbarItem>
					<LanguageSwitch />
				</NavbarItem>
				<NavbarItem>
					<ThemeSwitch />
				</NavbarItem>
			</NavbarContent>
		</NextUINavbar>
	)
}
