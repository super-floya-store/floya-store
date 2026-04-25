 'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null)

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
      <h1 className="text-3xl font-bold">التحليلات</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>إيرادات مسلّمة</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats?.revenue?.total?.toLocaleString?.() || 0} د.ج</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>الطلبات</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats?.orders?.total || 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>نفاد المخزون</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats?.products?.outOfStock || 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>تعليقات بانتظار المراجعة</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats?.moderation?.commentsPending || 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>إثباتات دفع بانتظار المراجعة</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats?.moderation?.paymentsSubmitted || 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>رسائل جديدة</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats?.moderation?.contactNew || 0}</p></CardContent>
        </Card>
      </div>
    </div>
  )
}
