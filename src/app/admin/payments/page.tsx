'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminEmptyState, AdminPageHeader, AdminPanel, AdminToolbar } from '@/components/admin/AdminShell'
import type { Order } from '@/types/order'
import { useUIStore } from '@/stores/ui-store'
import { formatDate, formatNumber } from '@/lib/utils/format'

export default function AdminPaymentsPage() {
  const locale = useUIStore((state) => state.locale)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const copy = locale === 'ar'
    ? {
        eyebrow: 'مراجعة المدفوعات',
        title: 'المدفوعات',
        subtitle: 'الطلبات التي رفعت إثبات دفع وتحتاج قبولاً أو رفضاً أو متابعة سريعة.',
        search: 'ابحث برقم الطلب أو اسم العميل أو رقم العملية',
        order: 'رقم الطلب',
        customer: 'العميل',
        phone: 'الهاتف',
        transaction: 'رقم العملية',
        date: 'التاريخ',
        action: 'الإجراء',
        review: 'مراجعة',
        empty: 'لا توجد مدفوعات بانتظار المراجعة.',
        emptyDescription: 'عند رفع إثباتات دفع جديدة ستظهر هنا تلقائياً.',
      }
    : {
        eyebrow: 'Payment review',
        title: 'Payments',
        subtitle: 'Orders with uploaded payment proof that need approval, rejection, or fast follow-up.',
        search: 'Search by order, customer, or transaction ID',
        order: 'Order number',
        customer: 'Customer',
        phone: 'Phone',
        transaction: 'Transaction ID',
        date: 'Date',
        action: 'Action',
        review: 'Review',
        empty: 'No payments are waiting for review.',
        emptyDescription: 'New payment proofs will appear here automatically.',
      }

  useEffect(() => {
    fetch('/api/orders?paymentStatus=submitted')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrders(data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredOrders = useMemo(() => {
    const normalized = query.toLowerCase().trim()
    if (!normalized) return orders
    return orders.filter((order) =>
      [order.order_number, order.customer_name, order.payment_transaction_id || '']
        .some((value) => value.toLowerCase().includes(normalized))
    )
  }, [orders, query])

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.subtitle} />

      <AdminToolbar>
        <label className="relative min-w-[260px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.search}
            className="h-11 w-full rounded-full border border-border bg-white pl-10 pr-4 text-sm text-foreground shadow-soft outline-none"
          />
        </label>
        <div className="text-sm text-muted-foreground">
          {formatNumber(filteredOrders.length, locale)} / {formatNumber(orders.length, locale)}
        </div>
      </AdminToolbar>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-20 rounded-[24px]" />)}
        </div>
      ) : filteredOrders.length === 0 ? (
        <AdminEmptyState title={copy.empty} description={copy.emptyDescription} />
      ) : (
        <AdminPanel className="overflow-hidden" contentClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="px-4 py-4 text-right font-medium">{copy.order}</th>
                  <th className="px-4 py-4 text-right font-medium">{copy.customer}</th>
                  <th className="px-4 py-4 text-right font-medium">{copy.phone}</th>
                  <th className="px-4 py-4 text-right font-medium">{copy.transaction}</th>
                  <th className="px-4 py-4 text-right font-medium">{copy.date}</th>
                  <th className="px-4 py-4 text-right font-medium">{copy.action}</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t border-border/70 hover:bg-muted/30">
                    <td className="px-4 py-4 font-semibold text-primary">{order.order_number}</td>
                    <td className="px-4 py-4">{order.customer_name}</td>
                    <td className="px-4 py-4">{order.customer_phone}</td>
                    <td className="px-4 py-4">{order.payment_transaction_id || '-'}</td>
                    <td className="px-4 py-4 text-muted-foreground">{order.payment_submitted_at ? formatDate(order.payment_submitted_at, locale) : '-'}</td>
                    <td className="px-4 py-4">
                      <Button size="sm" asChild className="rounded-full">
                        <Link href={`/admin/orders/${order.id}`}>
                          <ShieldAlert className="h-4 w-4" />
                          {copy.review}
                        </Link>
                      </Button>
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
