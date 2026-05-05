import type { Metadata } from 'next'
import localFont from 'next/font/local'
import Link from 'next/link'
import { MobileMenu } from '@/components/MobileMenu'
import './globals.css'

const playfairDisplay = localFont({
  src: [
    { path: '../public/fonts/display-regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/display-bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
})

const inter = localFont({
  src: [
    { path: '../public/fonts/sans-regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/sans-bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = localFont({
  src: [
    { path: '../public/fonts/mono-regular.ttf', weight: '400', style: 'normal' },
  ],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Scribe IQ — The Copywriting Bible',
  description:
    'A dark-themed editorial copywriting bible and AI generation tool for crafting authoritative, persona-driven copy across niches.',
}

const navLinks = [
  { label: 'Bible', href: '/bible' },
  { label: 'Personas', href: '/personas' },
  { label: 'Generate', href: '/generate' },
  { label: 'Hooks', href: '/hooks' },
  { label: 'Eras', href: '/eras' },
  { label: 'Interactions', href: '/interactions' },
]

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-canvas/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="font-display text-brand tracking-[0.2em] text-lg font-bold uppercase select-none"
          >
            SCRIBE IQ
          </Link>

          {/* Nav links — desktop only */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#8888A8] hover:text-brand transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <MobileMenu links={navLinks} />
        </div>
      </div>
    </nav>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`dark ${playfairDisplay.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans bg-canvas text-[#E8E8F0] antialiased">
        <Nav />
        <main className="min-h-screen pt-16">{children}</main>
      </body>
    </html>
  )
}
