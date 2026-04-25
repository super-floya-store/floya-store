'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { ExternalLink, Menu, X } from 'lucide-react'

interface AdminHeaderProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function AdminHeader({ sidebarOpen, onToggleSidebar }: AdminHeaderProps) {
  const { user } = useAuth()

  return (
    <header className="flex items-center justify-between border-b bg-background px-4 py-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border bg-white text-foreground shadow-soft transition hover:-translate-y-0.5 hover:shadow-medium"
          aria-label={sidebarOpen ? 'إخفاء الشريط الجانبي' : 'إظهار الشريط الجانبي'}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        <h1 className="text-lg font-semibold">لوحة الإدارة</h1>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/" target="_blank" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <ExternalLink className="h-4 w-4" />
          معاينة المتجر
        </Link>
        <span className="text-sm text-muted-foreground">
          {user?.full_name || user?.username}
        </span>
      </div>
    </header>
  )
}
