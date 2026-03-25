import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MatchGrid',
  description: 'Balanced futsal team generator',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} flex h-[100dvh] overflow-hidden bg-background`}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-6 lg:p-8 md:pb-6">
          {children}
        </main>
      </body>
    </html>
  )
}