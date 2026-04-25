'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import type { Order } from '@/types/order'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const paymentLabels: Record<string, string> = {
  pending: 'بانتظار الدفع',
  submitted: 'قيد مراجعة الدفع',
  paid: 'مدفوع',
  rejected: 'مرفوض',
  failed: 'فشل',
  refunded: 'مسترجع',
}

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  processing: 'قيد المعالجة',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغى',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentFilter, setPaymentFilter] = useState('all')

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
      <h1 className="text-3xl font-bold">الطلبات</h1>
      <div className="flex flex-wrap gap-2">
        {[
          { value: 'all', label: 'كل المدفوعات' },
          { value: 'submitted', label: 'بانتظار المراجعة' },
          { value: 'paid', label: 'مدفوعة' },
          { value: 'rejected', label: 'مرفوضة' },
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
                <th className="px-4 py-3 text-right font-medium">رقم الطلب</th>
                <th className="px-4 py-3 text-right font-medium">العميل</th>
                <th className="px-4 py-3 text-right font-medium">الهاتف</th>
                <th className="px-4 py-3 text-right font-medium">المجموع</th>
                <th className="px-4 py-3 text-right font-medium">الحالة</th>
                <th className="px-4 py-3 text-right font-medium">الدفع</th>
                <th className="px-4 py-3 text-right font-medium">التاريخ</th>
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
                  <td className="px-4 py-3 font-medium">{order.total.toLocaleString()} د.ج</td>
                  <td className="px-4 py-3">
                    <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{paymentLabels[order.payment_status] || order.payment_status}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('ar-DZ')}
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
