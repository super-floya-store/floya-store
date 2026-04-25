'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/stores/ui-store'
import {
  LayoutDashboard,
  ShoppingBag,
  Shapes,
  Receipt,
  BarChart3,
  Settings,
  User,
  LogOut,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  Store,
  Mail,
  Truck,
  ShieldAlert,
  PackageSearch,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/admin/products', label: 'المنتجات', icon: ShoppingBag },
  { href: '/admin/categories', label: 'الفئات', icon: Shapes },
  { href: '/admin/orders', label: 'الطلبات', icon: Receipt },
  { href: '/admin/payments', label: 'المدفوعات', icon: ShieldAlert },
  { href: '/admin/analytics', label: 'التحليلات', icon: BarChart3 },
  { href: '/admin/comments', label: 'التعليقات', icon: MessageSquare },
  { href: '/admin/inbox', label: 'الرسائل', icon: Mail },
  { href: '/admin/customers', label: 'العملاء', icon: PackageSearch },
  { href: '/admin/suppliers', label: 'الموردون', icon: Truck },
  { href: '/admin/settings', label: 'الإعدادات', icon: Settings },
]

interface AdminSidebarProps {
  open: boolean
  onClose: () => void
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const locale = useUIStore((state) => state.locale)

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
            ? open ? 'right-0 translate-x-0 border-l border-white/10' : 'right-0 translate-x-full border-l border-white/10'
            : open ? 'left-0 translate-x-0 border-r border-white/10' : 'left-0 -translate-x-full border-r border-white/10'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 p-6">
            <Link href="/admin" className="text-xl font-bold text-white">
              فلويا ستور
            </Link>
            {user && <p className="mt-1 text-sm text-white/60">{user.full_name || user.username}</p>}
            <div className="mt-4 flex gap-2">
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white/85 transition hover:bg-white/15"
              >
                <Store className="h-3.5 w-3.5" />
                الواجهة
              </Link>
              <Link
                href="/products"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white/85 transition hover:bg-white/15"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                المنتجات
              </Link>
            </div>
          </div>

          <nav className="premium-scrollbar flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className={cn('h-4 w-4', locale === 'ar' ? 'mr-auto' : 'ml-auto rotate-180')} />}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-white/10 p-4 space-y-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <ExternalLink className="h-5 w-5" />
              <span>زيارة المتجر</span>
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
              <span>الملف الشخصي</span>
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      <aside className={`sticky top-0 hidden h-screen w-64 shrink-0 bg-secondary text-secondary-foreground shadow-heavy xl:w-72 2xl:w-80 lg:block ${
        locale === 'ar' ? 'border-l border-white/10' : 'border-r border-white/10'
      }`}>
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 p-6">
            <Link href="/admin" className="text-xl font-bold text-white">
              فلويا ستور
            </Link>
            {user && <p className="mt-1 text-sm text-white/60">{user.full_name || user.username}</p>}
            <div className="mt-4 flex gap-2">
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white/85 transition hover:bg-white/15"
              >
                <Store className="h-3.5 w-3.5" />
                الواجهة
              </Link>
              <Link
                href="/products"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white/85 transition hover:bg-white/15"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                المنتجات
              </Link>
            </div>
          </div>

          <nav className="premium-scrollbar flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className={cn('h-4 w-4', locale === 'ar' ? 'mr-auto' : 'ml-auto rotate-180')} />}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-white/10 p-4 space-y-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <ExternalLink className="h-5 w-5" />
              <span>زيارة المتجر</span>
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
              <span>الملف الشخصي</span>
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
