'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    } else if (!loading && user && !['admin', 'super_admin'].includes(user.role)) {
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
    <div className="min-h-screen bg-muted/30 lg:flex lg:flex-row-reverse">
      {sidebarOpen ? <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /> : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((value) => !value)} />
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
