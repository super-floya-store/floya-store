'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Order } from '@/types/order'

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/orders?paymentStatus=submitted')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrders(data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مراجعة المدفوعات</h1>
          <p className="mt-1 text-sm text-muted-foreground">الطلبات التي رفعت إثبات دفع وتنتظر القبول أو الرفض.</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-20" />)}
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-right font-medium">رقم الطلب</th>
                <th className="px-4 py-3 text-right font-medium">العميل</th>
                <th className="px-4 py-3 text-right font-medium">الهاتف</th>
                <th className="px-4 py-3 text-right font-medium">رقم العملية</th>
                <th className="px-4 py-3 text-right font-medium">التاريخ</th>
                <th className="px-4 py-3 text-right font-medium">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="px-4 py-3 font-medium text-primary">{order.order_number}</td>
                  <td className="px-4 py-3">{order.customer_name}</td>
                  <td className="px-4 py-3">{order.customer_phone}</td>
                  <td className="px-4 py-3">{order.payment_transaction_id || '-'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{order.payment_submitted_at ? new Date(order.payment_submitted_at).toLocaleDateString('ar-DZ') : '-'}</td>
                  <td className="px-4 py-3">
                    <Button size="sm" asChild>
                      <Link href={`/admin/orders/${order.id}`}>مراجعة</Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr className="border-t">
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">لا توجد مدفوعات بانتظار المراجعة.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
