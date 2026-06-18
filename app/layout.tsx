import '@/styles/globals.css'
import type { Metadata, Viewport } from 'next'
import {Providers} from '@/app/providers'
import {Navbar} from '@/components/navbar'
import clsx from 'clsx'
import {fontSans} from '@/config/fonts'
import { resolveLocale, resolveTheme } from '@/app/state/server'
import type { Theme } from '@/app/state/keys'

export const metadata: Metadata = {
  title: 'Minecraft Monitor',
  description: 'Minecraft Monitor',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

// Tailwind/NextUI's --background tokens. These are inlined on <html> so that
// the very first paint (before globals.css is parsed) already uses the right
// background color, instead of flashing the UA default white.
const BG_BY_THEME: Record<Theme, string> = {
  light: '#ffffff',
  dark: '#000000',
}

const RootLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const locale = resolveLocale()
  const theme = resolveTheme()
  return (
      <html
          lang={locale}
          className={theme}
          style={{ colorScheme: theme, backgroundColor: BG_BY_THEME[theme] }}
          suppressHydrationWarning
      >
      <body
          className={clsx(
              'min-h-screen bg-background font-sans antialiased',
              fontSans.variable
          )}
      >
      <Providers initialLocale={locale} initialTheme={theme}>
          <div className='relative flex flex-col min-h-screen'>
              <Navbar/>
              <main className='container mx-auto max-w-7xl pt-6 px-3 sm:px-6 flex-grow'>
                  {children}
              </main>
          </div>
      </Providers>
      </body>
      </html>
  )
}

export default RootLayout
