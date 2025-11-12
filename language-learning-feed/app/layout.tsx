import type { Metadata } from 'next'
import { Geist, Geist_Mono, Bricolage_Grotesque } from 'next/font/google'
import MobileShell from '@/components/layout/MobileShell'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

const display = Bricolage_Grotesque({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://langflix.app'),
  title: 'Langflix — Swipe. Learn. Repeat.',
  description: 'The TikTok of language learning. Swipe through content you love, earn streaks, and reach fluency with playful rewards.',
  themeColor: '#070711',
  appleWebApp: {
    title: 'Langflix',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    title: 'Langflix — Swipe. Learn. Repeat.',
    description: 'Binge-worthy language immersion with Duolingo-style gamification.',
    url: 'https://langflix.app',
    siteName: 'Langflix',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Langflix — Swipe. Learn. Repeat.',
    description: 'Binge-worthy language immersion with Duolingo-style gamification.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-brand-surface">
      <body className={`${geistSans.variable} ${geistMono.variable} ${display.variable} antialiased`}>
        <MobileShell defaultBackground="hero">{children}</MobileShell>
      </body>
    </html>
  )
}
