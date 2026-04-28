'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useUIStore } from '@/stores/ui-store'
import { formatPrice } from '@/lib/utils/format'

export default function AdminDashboardPage() {
  const locale = useUIStore((state) => state.locale)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const copy = locale === 'ar'
    ? {
        title: 'لوحة التحكم',
        revenue: 'الإيرادات (هذا الشهر)',
        orders: 'الطلبات (هذا الشهر)',
        products: 'المنتجات المنشورة',
        outOfStock: 'نفذ المخزون',
      }
    : {
        title: 'Dashboard',
        revenue: 'Revenue (this month)',
        orders: 'Orders (this month)',
        products: 'Published products',
        outOfStock: 'Out of stock',
      }

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats')
        const data = await res.json()
        if (data.success) {
          setStats(data.data)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{copy.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{copy.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="surface-card border-white/70 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{copy.revenue}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              <bdi>{formatPrice(stats?.revenue?.thisPeriod || 0, 'DZD', locale)}</bdi>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-card border-white/70 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{copy.orders}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats?.orders?.thisPeriod || 0}</div>
          </CardContent>
        </Card>

        <Card className="surface-card border-white/70 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{copy.products}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats?.products?.published || 0}</div>
          </CardContent>
        </Card>

        <Card className="surface-card border-white/70 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{copy.outOfStock}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats?.products?.outOfStock > 0 ? 'text-destructive' : ''}`}>
              {stats?.products?.outOfStock || 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
