import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { ToastProvider } from '@/hooks/useToast'
import { Toaster } from '@/components/ui/toaster'
import { LocaleSync } from '@/components/shared/LocaleSync'

export const metadata: Metadata = {
  title: 'Floya Store - فلويا ستور',
  description: 'متجر فلويا - تجربة تسوق فاخرة',
  metadataBase: new URL('https://floya.dz'),
  openGraph: {
    title: 'Floya Store - فلويا ستور',
    description: 'متجر فلويا - تجربة تسوق فاخرة',
    images: ['/images/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <ToastProvider>
            <LocaleSync />
            {children}
            <Toaster />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
