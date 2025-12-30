import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '宝鸡中学高校论坛 - 学长学姐为你答疑解惑',
  description: '宝鸡中学学生专属的大学信息平台，各大学学长学姐在线答疑',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen flex flex-col">
            <div className="flex-grow">
              {children}
            </div>
            <Footer />
          </main>
        </Providers>
      </body>
    </html>
  )
}
