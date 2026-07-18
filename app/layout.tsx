// import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  display: 'swap',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    template: '%s | Contact Management',
    default: 'Contact Management',
  },
  description: 'Manage your contacts easily and efficiently',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      suppressHydrationWarning
      lang='en'
      className={cn('h-full', 'antialiased', jetBrainsMono.variable, 'font-sans', inter.variable)}>
      <body className='min-h-full flex flex-col'>
        {/* <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange>
        </ThemeProvider> */}
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
