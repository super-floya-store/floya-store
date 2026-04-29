'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminEmptyState, AdminPageHeader, AdminPanel, AdminToolbar } from '@/components/admin/AdminShell'
import type { Order } from '@/types/order'
import { useUIStore } from '@/stores/ui-store'
import { formatDate, formatNumber, formatPrice } from '@/lib/utils/format'

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
  const [query, setQuery] = useState('')
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
        eyebrow: 'إدارة الطلبات',
        title: 'الطلبات',
        description: 'متابعة الطلبات والدفع والحالات التشغيلية من واجهة واحدة قابلة للفرز السريع.',
        all: 'كل المدفوعات',
        submitted: 'بانتظار المراجعة',
        paid: 'مدفوعة',
        rejected: 'مرفوضة',
        search: 'ابحث برقم الطلب أو اسم العميل أو الهاتف',
        order: 'رقم الطلب',
        customer: 'العميل',
        phone: 'الهاتف',
        total: 'المجموع',
        status: 'الحالة',
        payment: 'الدفع',
        date: 'التاريخ',
        emptyTitle: 'لا توجد طلبات مطابقة',
        emptyDescription: 'غيّر الفلاتر أو عبارة البحث لعرض نتائج أخرى.',
      }
    : {
        eyebrow: 'Order operations',
        title: 'Orders',
        description: 'Track orders, payments, and operational statuses from one faster review surface.',
        all: 'All payments',
        submitted: 'Waiting for review',
        paid: 'Paid',
        rejected: 'Rejected',
        search: 'Search by order number, customer, or phone',
        order: 'Order number',
        customer: 'Customer',
        phone: 'Phone',
        total: 'Total',
        status: 'Status',
        payment: 'Payment',
        date: 'Date',
        emptyTitle: 'No matching orders',
        emptyDescription: 'Change the filters or search term to see other results.',
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

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (!query.trim()) return true
      const normalized = query.toLowerCase()
      return [order.order_number, order.customer_name, order.customer_phone]
        .some((value) => value?.toLowerCase().includes(normalized))
    })
  }, [orders, query])

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />

      <AdminToolbar>
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:flex-wrap">
          <label className="relative min-w-[260px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.search}
              className="h-11 w-full rounded-full border border-border bg-white pl-10 pr-4 text-sm text-foreground shadow-soft outline-none"
            />
          </label>
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
        </div>
        <div className="text-sm text-muted-foreground">
          {formatNumber(filteredOrders.length, locale)} / {formatNumber(orders.length, locale)}
        </div>
      </AdminToolbar>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-[24px]" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <AdminEmptyState title={copy.emptyTitle} description={copy.emptyDescription} />
      ) : (
        <AdminPanel className="overflow-hidden" contentClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="px-4 py-4 text-right font-medium">{copy.order}</th>
                  <th className="px-4 py-4 text-right font-medium">{copy.customer}</th>
                  <th className="px-4 py-4 text-right font-medium">{copy.phone}</th>
                  <th className="px-4 py-4 text-right font-medium">{copy.total}</th>
                  <th className="px-4 py-4 text-right font-medium">{copy.status}</th>
                  <th className="px-4 py-4 text-right font-medium">{copy.payment}</th>
                  <th className="px-4 py-4 text-right font-medium">{copy.date}</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t border-border/70 hover:bg-muted/30">
                    <td className="px-4 py-4">
                      <Link href={`/admin/orders/${order.id}`} className="font-semibold text-primary hover:underline">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-4">{order.customer_name}</td>
                    <td className="px-4 py-4">{order.customer_phone}</td>
                    <td className="px-4 py-4 font-semibold text-secondary"><bdi>{formatPrice(order.total, 'DZD', locale)}</bdi></td>
                    <td className="px-4 py-4">
                      <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">{paymentLabels[order.payment_status] || order.payment_status}</td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {formatDate(order.created_at, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminPanel>
      )}
    </div>
  )
}
