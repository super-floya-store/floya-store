 'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUIStore } from '@/stores/ui-store'
import { formatNumber, formatPrice } from '@/lib/utils/format'

export default function AdminAnalyticsPage() {
  const locale = useUIStore((state) => state.locale)
  const [stats, setStats] = useState<any>(null)
  const copy = locale === 'ar'
    ? {
        title: 'التحليلات',
        revenue: 'الإيرادات المسلّمة',
        orders: 'إجمالي الطلبات',
        outOfStock: 'نفاد المخزون',
        commentsPending: 'تعليقات بانتظار المراجعة',
        paymentsPending: 'إثباتات دفع بانتظار المراجعة',
        messages: 'رسائل جديدة',
      }
    : {
        title: 'Analytics',
        revenue: 'Delivered revenue',
        orders: 'Total orders',
        outOfStock: 'Out of stock',
        commentsPending: 'Comments pending review',
        paymentsPending: 'Payment proofs pending review',
        messages: 'New messages',
      }

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.data)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{copy.title}</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>{copy.revenue}</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold"><bdi>{formatPrice(stats?.revenue?.total || 0, 'DZD', locale)}</bdi></p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{copy.orders}</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatNumber(stats?.orders?.total || 0, locale)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{copy.outOfStock}</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatNumber(stats?.products?.outOfStock || 0, locale)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{copy.commentsPending}</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatNumber(stats?.moderation?.commentsPending || 0, locale)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{copy.paymentsPending}</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatNumber(stats?.moderation?.paymentsSubmitted || 0, locale)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{copy.messages}</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatNumber(stats?.moderation?.contactNew || 0, locale)}</p></CardContent>
        </Card>
      </div>
    </div>
  )
}
