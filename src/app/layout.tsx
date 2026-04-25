import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { ToastProvider } from '@/hooks/useToast'
import { Toaster } from '@/components/ui/toaster'
import { LocaleSync } from '@/components/shared/LocaleSync'
import { BrandingSync } from '@/components/shared/BrandingSync'
import { getStoreSettings } from '@/lib/settings/store-settings'
import { env } from '@/config/env'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings()
  const titleEn = settings.store_name?.en || 'Floya Store'
  const titleAr = settings.store_name?.ar || 'فلويا ستور'
  const description = settings.store_description?.ar || settings.store_description?.en || 'متجر إلكتروني'
  const appUrl = env.NEXT_PUBLIC_APP_URL.startsWith('http') ? env.NEXT_PUBLIC_APP_URL : `https://${env.NEXT_PUBLIC_APP_URL}`
  const logoUrl = settings.logo_url || undefined

  return {
    title: `${titleEn} - ${titleAr}`,
    description,
    metadataBase: new URL(appUrl),
    openGraph: {
      title: `${titleEn} - ${titleAr}`,
      description,
      images: logoUrl ? [logoUrl] : ['/images/og-image.png'],
    },
    icons: logoUrl ? { icon: logoUrl, shortcut: logoUrl, apple: logoUrl } : undefined,
  }
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
            <BrandingSync />
            {children}
            <Toaster />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
