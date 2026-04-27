'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { useUIStore } from '@/stores/ui-store'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const locale = useUIStore((state) => state.locale)
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    } else if (!loading && user && user.role !== 'admin') {
      router.replace('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className={`min-h-screen bg-muted/30 lg:flex ${locale === 'ar' ? 'lg:flex-row' : 'lg:flex-row'}`}>
      {sidebarOpen ? <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /> : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((value) => !value)} />
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
