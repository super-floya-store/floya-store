'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUIStore } from '@/stores/ui-store'
import type { OrderWithItems } from '@/types/order'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils/format'

export default function ReceiptPage({ params }: { params: { orderNumber: string } }) {
  const locale = useUIStore((state) => state.locale)
  const [order, setOrder] = useState<OrderWithItems | null>(null)

  useEffect(() => {
    fetch(`/api/account/orders/${params.orderNumber}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrder(data.data)
        }
      })
  }, [params.orderNumber])

  const copy = locale === 'ar'
    ? {
        title: 'إيصال الطلب',
        print: 'تنزيل PDF / طباعة',
        back: 'العودة إلى الحساب',
        customer: 'العميل',
        payment: 'الدفع',
        total: 'الإجمالي',
        quantity: 'الكمية',
        item: 'المنتج',
        amount: 'المبلغ',
      }
    : {
        title: 'Order receipt',
        print: 'Download PDF / Print',
        back: 'Back to account',
        customer: 'Customer',
        payment: 'Payment',
        total: 'Total',
        quantity: 'Qty',
        item: 'Item',
        amount: 'Amount',
      }

  if (!order) {
    return <div className="container mx-auto px-4 py-10 text-sm text-muted-foreground">Loading...</div>
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 md:px-6 print:px-0 print:py-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/account">{copy.back}</Link>
        </Button>
        <Button className="rounded-full" onClick={() => window.print()}>
          {copy.print}
        </Button>
      </div>

      <Card className="surface-card rounded-[28px] print:shadow-none">
        <CardContent className="space-y-6 p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="section-kicker w-fit">FLOYA STORE</p>
              <h1 className="mt-4 text-3xl font-bold">{copy.title}</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>#{order.order_number}</p>
              <p>{new Date(order.created_at).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US')}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-background/70 p-4">
              <p className="text-xs text-muted-foreground">{copy.customer}</p>
              <p className="mt-2 font-semibold">{order.customer_name}</p>
              <p className="text-sm text-muted-foreground">{order.customer_email || '-'}</p>
            </div>
            <div className="rounded-2xl border bg-background/70 p-4">
              <p className="text-xs text-muted-foreground">{copy.payment}</p>
              <p className="mt-2 font-semibold">{order.payment_method}</p>
              <p className="text-sm text-muted-foreground">{order.payment_status}</p>
            </div>
            <div className="rounded-2xl border bg-background/70 p-4">
              <p className="text-xs text-muted-foreground">{copy.total}</p>
              <p className="mt-2 text-xl font-bold"><bdi>{formatPrice(Number(order.total), 'DZD', locale)}</bdi></p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left">{copy.item}</th>
                  <th className="px-4 py-3 text-left">{copy.quantity}</th>
                  <th className="px-4 py-3 text-left">{copy.amount}</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3">{locale === 'ar' ? item.product_name_ar : item.product_name_en}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3"><bdi>{formatPrice(Number(item.total_price), 'DZD', locale)}</bdi></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
