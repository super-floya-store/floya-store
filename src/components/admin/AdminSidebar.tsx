'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/stores/ui-store'
import { useStoreBranding } from '@/hooks/useStoreBranding'
import { adminNavigationSections } from '@/config/admin-navigation'
import {
  User,
  LogOut,
  ExternalLink,
  ChevronRight,
  Store,
} from 'lucide-react'

interface AdminSidebarProps {
  open: boolean
  onClose: () => void
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const locale = useUIStore((state) => state.locale)
  const branding = useStoreBranding()
  const copy = locale === 'ar'
    ? {
        storefront: 'الواجهة',
        products: 'المنتجات',
        visitStore: 'زيارة المتجر',
        profile: 'الملف الشخصي',
        logout: 'تسجيل الخروج',
        sections: {
          overview: 'نظرة عامة',
          catalog: 'الكتالوج',
          operations: 'العمليات',
          communication: 'التواصل',
          configuration: 'إعدادات المتجر',
        },
      }
    : {
        storefront: 'Storefront',
        products: 'Products',
        visitStore: 'Visit store',
        profile: 'Profile',
        logout: 'Log out',
        sections: {
          overview: 'Overview',
          catalog: 'Catalog',
          operations: 'Operations',
          communication: 'Communication',
          configuration: 'Store setup',
        },
      }
  const brandName = locale === 'ar' ? branding.nameAr : branding.nameEn

  const sectionLabel = (sectionId: string, labelAr: string, labelEn: string) => {
    if (locale === 'ar') return labelAr
    return copy.sections?.[sectionId as keyof typeof copy.sections] || labelEn
  }

  const renderNavigation = () => (
    <>
      {adminNavigationSections.map((section) => (
        <div key={section.id} className="space-y-2">
          <p className="px-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
            {sectionLabel(section.id, section.labelAr, section.labelEn)}
          </p>
          <div className="space-y-1">
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-start gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/72 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span>{locale === 'ar' ? item.labelAr : item.labelEn}</span>
                      {isActive ? <ChevronRight className={cn('h-4 w-4 shrink-0', locale === 'ar' ? 'mr-auto' : 'ml-auto rotate-180')} /> : null}
                    </div>
                    <p className="mt-1 text-xs text-white/45 group-hover:text-white/55">
                      {locale === 'ar' ? item.descriptionAr : item.descriptionEn}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </>
  )

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 z-40 h-[100dvh] w-[86vw] max-w-sm bg-secondary text-secondary-foreground shadow-heavy transition-transform duration-300 lg:hidden ${
          locale === 'ar'
            ? open
              ? 'right-0 translate-x-0 border-l border-white/10'
              : 'right-0 translate-x-full border-l border-white/10'
            : open
              ? 'left-0 translate-x-0 border-r border-white/10'
              : 'left-0 -translate-x-full border-r border-white/10'
        }`}
      >
        <div className={`flex h-full flex-col ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
          <div className="border-b border-white/10 p-6">
            <Link href="/admin" className="text-xl font-bold text-white">
              <span className="flex items-center gap-3">
                {branding.logoUrl ? (
                  <Image src={branding.logoUrl} alt={brandName} width={36} height={36} className="rounded-full object-cover" />
                ) : null}
                <span>{brandName}</span>
              </span>
            </Link>
            {user && <p className="mt-1 text-sm text-white/60">{user.full_name || user.email}</p>}
            <div className="mt-4 flex gap-2">
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white/85 transition hover:bg-white/15"
              >
                <Store className="h-3.5 w-3.5" />
                {copy.storefront}
              </Link>
              <Link
                href="/products"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white/85 transition hover:bg-white/15"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {copy.products}
              </Link>
            </div>
          </div>

          <nav className="premium-scrollbar flex-1 space-y-6 overflow-y-auto p-4">{renderNavigation()}</nav>

          <div className="border-t border-white/10 p-4 space-y-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <ExternalLink className="h-5 w-5" />
              <span>{copy.visitStore}</span>
            </Link>
            <Link
              href="/admin/profile"
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                pathname === '/admin/profile'
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              )}
            >
              <User className="h-5 w-5" />
              <span>{copy.profile}</span>
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
              <span>{copy.logout}</span>
            </button>
          </div>
        </div>
      </aside>

      <aside className={`sticky top-0 hidden h-screen w-64 shrink-0 bg-secondary text-secondary-foreground shadow-heavy xl:w-72 2xl:w-80 lg:block ${
        locale === 'ar' ? 'border-l border-white/10' : 'border-r border-white/10'
      }`}>
        <div className={`flex h-full flex-col ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
          <div className="border-b border-white/10 p-6">
            <Link href="/admin" className="text-xl font-bold text-white">
              <span className="flex items-center gap-3">
                {branding.logoUrl ? (
                  <Image src={branding.logoUrl} alt={brandName} width={36} height={36} className="rounded-full object-cover" />
                ) : null}
                <span>{brandName}</span>
              </span>
            </Link>
            {user && <p className="mt-1 text-sm text-white/60">{user.full_name || user.email}</p>}
            <div className="mt-4 flex gap-2">
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white/85 transition hover:bg-white/15"
              >
                <Store className="h-3.5 w-3.5" />
                {copy.storefront}
              </Link>
              <Link
                href="/products"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white/85 transition hover:bg-white/15"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {copy.products}
              </Link>
            </div>
          </div>

          <nav className="premium-scrollbar flex-1 space-y-6 overflow-y-auto p-4">{renderNavigation()}</nav>

          <div className="border-t border-white/10 p-4 space-y-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <ExternalLink className="h-5 w-5" />
              <span>{copy.visitStore}</span>
            </Link>
            <Link
              href="/admin/profile"
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                pathname === '/admin/profile'
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              )}
            >
              <User className="h-5 w-5" />
              <span>{copy.profile}</span>
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
              <span>{copy.logout}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
