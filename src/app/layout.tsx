import type { Metadata } from 'next'
import { Montserrat, Syne } from 'next/font/google'
import { Providers } from '@/providers'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-montserrat',
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LaserZone Hub',
  description: 'Platforma interna LaserZone',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro" className="dark">
      <body className={`${montserrat.variable} ${syne.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
