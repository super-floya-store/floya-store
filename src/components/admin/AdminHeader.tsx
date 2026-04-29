'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLink, Languages, Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/stores/ui-store'
import { getAdminNavItem } from '@/config/admin-navigation'

interface AdminHeaderProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function AdminHeader({ sidebarOpen, onToggleSidebar }: AdminHeaderProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const locale = useUIStore((state) => state.locale)
  const setLocale = useUIStore((state) => state.setLocale)
  const activeItem = getAdminNavItem(pathname)
  const copy = locale === 'ar'
    ? {
        hideSidebar: 'إخفاء الشريط الجانبي',
        showSidebar: 'إظهار الشريط الجانبي',
        title: 'لوحة الإدارة',
        preview: 'معاينة المتجر',
        switchLocale: 'English',
        signedIn: 'تم تسجيل الدخول كمدير',
        fallbackPageTitle: 'لوحة التحكم',
        fallbackPageDescription: 'إدارة سريعة لأقسام المتجر والعمليات اليومية.',
      }
    : {
        hideSidebar: 'Hide sidebar',
        showSidebar: 'Show sidebar',
        title: 'Admin dashboard',
        preview: 'Preview store',
        switchLocale: 'العربية',
        signedIn: 'Signed in as admin',
        fallbackPageTitle: 'Dashboard',
        fallbackPageDescription: 'Fast access to store operations and daily admin work.',
      }

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  }, [locale])

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-background/90 backdrop-blur">
      <div className="flex flex-col gap-4 px-4 py-4 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border bg-white text-foreground shadow-soft transition hover:-translate-y-0.5 hover:shadow-medium"
              aria-label={sidebarOpen ? copy.hideSidebar : copy.showSidebar}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">{copy.title}</p>
              <h1 className="truncate text-xl font-semibold text-foreground">
                {locale === 'ar' ? activeItem?.labelAr || copy.fallbackPageTitle : activeItem?.labelEn || copy.fallbackPageTitle}
              </h1>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {locale === 'ar'
                  ? activeItem?.descriptionAr || copy.fallbackPageDescription
                  : activeItem?.descriptionEn || copy.fallbackPageDescription}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-semibold text-foreground shadow-soft transition hover:-translate-y-0.5 hover:shadow-medium"
              aria-label={copy.switchLocale}
            >
              <Languages className="h-4 w-4" />
              <span>{locale === 'ar' ? 'AR / EN' : 'EN / AR'}</span>
            </button>
            <Link href="/" target="_blank" className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-semibold text-foreground shadow-soft transition hover:-translate-y-0.5 hover:shadow-medium">
              <ExternalLink className="h-4 w-4" />
              {copy.preview}
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="rounded-full bg-primary/8 px-3 py-1 font-medium text-primary">{copy.signedIn}</span>
          <span className="truncate">{user?.full_name || user?.email}</span>
        </div>
      </div>
    </header>
  )
}
