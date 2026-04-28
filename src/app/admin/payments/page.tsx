'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Order } from '@/types/order'
import { useUIStore } from '@/stores/ui-store'
import { formatDate } from '@/lib/utils/format'

export default function AdminPaymentsPage() {
  const locale = useUIStore((state) => state.locale)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const copy = locale === 'ar'
    ? {
        title: 'مراجعة المدفوعات',
        subtitle: 'الطلبات التي رفعت إثبات دفع وتنتظر القبول أو الرفض.',
        order: 'رقم الطلب',
        customer: 'العميل',
        phone: 'الهاتف',
        transaction: 'رقم العملية',
        date: 'التاريخ',
        action: 'الإجراء',
        review: 'مراجعة',
        empty: 'لا توجد مدفوعات بانتظار المراجعة.',
      }
    : {
        title: 'Payment review',
        subtitle: 'Orders with uploaded payment proof waiting for approval or rejection.',
        order: 'Order number',
        customer: 'Customer',
        phone: 'Phone',
        transaction: 'Transaction ID',
        date: 'Date',
        action: 'Action',
        review: 'Review',
        empty: 'No payments are waiting for review.',
      }

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
          <h1 className="text-3xl font-bold">{copy.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
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
                <th className="px-4 py-3 text-right font-medium">{copy.order}</th>
                <th className="px-4 py-3 text-right font-medium">{copy.customer}</th>
                <th className="px-4 py-3 text-right font-medium">{copy.phone}</th>
                <th className="px-4 py-3 text-right font-medium">{copy.transaction}</th>
                <th className="px-4 py-3 text-right font-medium">{copy.date}</th>
                <th className="px-4 py-3 text-right font-medium">{copy.action}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="px-4 py-3 font-medium text-primary">{order.order_number}</td>
                  <td className="px-4 py-3">{order.customer_name}</td>
                  <td className="px-4 py-3">{order.customer_phone}</td>
                  <td className="px-4 py-3">{order.payment_transaction_id || '-'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{order.payment_submitted_at ? formatDate(order.payment_submitted_at, locale) : '-'}</td>
                  <td className="px-4 py-3">
                    <Button size="sm" asChild>
                      <Link href={`/admin/orders/${order.id}`}>{copy.review}</Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr className="border-t">
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">{copy.empty}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
