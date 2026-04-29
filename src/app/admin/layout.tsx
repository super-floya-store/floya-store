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
    <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(184,134,59,0.12),_transparent_28%),linear-gradient(180deg,_rgba(248,246,241,0.96),_rgba(243,239,232,0.88))] lg:flex">
      {sidebarOpen ? <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /> : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((value) => !value)} />
        <main className="min-w-0 flex-1 p-4 md:p-6 xl:p-8">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
