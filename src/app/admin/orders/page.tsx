'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import type { Order } from '@/types/order'
import { useUIStore } from '@/stores/ui-store'
import { formatDate, formatPrice } from '@/lib/utils/format'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function AdminOrdersPage() {
  const locale = useUIStore((state) => state.locale)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentFilter, setPaymentFilter] = useState('all')
  const paymentLabels: Record<string, string> = locale === 'ar'
    ? {
        pending: 'بانتظار الدفع',
        submitted: 'قيد مراجعة الدفع',
        paid: 'مدفوعة',
        rejected: 'مرفوضة',
        failed: 'فشل',
        refunded: 'مسترجع',
      }
    : {
        pending: 'Pending payment',
        submitted: 'Payment under review',
        paid: 'Paid',
        rejected: 'Rejected',
        failed: 'Failed',
        refunded: 'Refunded',
      }
  const statusLabels: Record<string, string> = locale === 'ar'
    ? {
        pending: 'قيد الانتظار',
        confirmed: 'مؤكد',
        processing: 'قيد المعالجة',
        shipped: 'تم الشحن',
        delivered: 'تم التوصيل',
        cancelled: 'ملغى',
      }
    : {
        pending: 'Pending',
        confirmed: 'Confirmed',
        processing: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
      }
  const copy = locale === 'ar'
    ? {
        title: 'الطلبات',
        all: 'كل المدفوعات',
        submitted: 'بانتظار المراجعة',
        paid: 'مدفوعة',
        rejected: 'مرفوضة',
        order: 'رقم الطلب',
        customer: 'العميل',
        phone: 'الهاتف',
        total: 'المجموع',
        status: 'الحالة',
        payment: 'الدفع',
        date: 'التاريخ',
      }
    : {
        title: 'Orders',
        all: 'All payments',
        submitted: 'Waiting for review',
        paid: 'Paid',
        rejected: 'Rejected',
        order: 'Order number',
        customer: 'Customer',
        phone: 'Phone',
        total: 'Total',
        status: 'Status',
        payment: 'Payment',
        date: 'Date',
      }

  useEffect(() => {
    async function fetchOrders() {
      try {
        const params = new URLSearchParams()
        if (paymentFilter !== 'all') params.set('paymentStatus', paymentFilter)
        const res = await fetch(`/api/orders?${params.toString()}`)
        const data = await res.json()
        if (data.success) {
          setOrders(data.data)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [paymentFilter])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{copy.title}</h1>
      <div className="flex flex-wrap gap-2">
        {[
          { value: 'all', label: copy.all },
          { value: 'submitted', label: copy.submitted },
          { value: 'paid', label: copy.paid },
          { value: 'rejected', label: copy.rejected },
        ].map((item) => (
          <button key={item.value} onClick={() => setPaymentFilter(item.value)} className={`rounded-full px-4 py-2 text-sm ${paymentFilter === item.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-right font-medium">{copy.order}</th>
                <th className="px-4 py-3 text-right font-medium">{copy.customer}</th>
                <th className="px-4 py-3 text-right font-medium">{copy.phone}</th>
                <th className="px-4 py-3 text-right font-medium">{copy.total}</th>
                <th className="px-4 py-3 text-right font-medium">{copy.status}</th>
                <th className="px-4 py-3 text-right font-medium">{copy.payment}</th>
                <th className="px-4 py-3 text-right font-medium">{copy.date}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-primary hover:underline">
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{order.customer_name}</td>
                  <td className="px-4 py-3">{order.customer_phone}</td>
                  <td className="px-4 py-3 font-medium"><bdi>{formatPrice(order.total, 'DZD', locale)}</bdi></td>
                  <td className="px-4 py-3">
                    <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{paymentLabels[order.payment_status] || order.payment_status}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(order.created_at, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
