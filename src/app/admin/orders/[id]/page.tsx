'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { OrderWithItems } from '@/types/order'
import Image from 'next/image'

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  processing: 'قيد المعالجة',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغى',
}

const paymentLabels: Record<string, string> = {
  pending: 'بانتظار الدفع',
  submitted: 'إثبات مرفوع بانتظار المراجعة',
  paid: 'تم قبول الدفع',
  rejected: 'تم رفض الدفع',
  failed: 'فشل',
  refunded: 'مسترجع',
}

export default function AdminOrderDetailPage() {
  const params = useParams()
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [followUp, setFollowUp] = useState({
    estimatedDeliveryDays: '',
    estimatedDeliveryDate: '',
    followUpMessage: '',
  })

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${params.id}`)
        const data = await res.json()
        if (data.success) {
          setOrder(data.data)
          setFollowUp({
            estimatedDeliveryDays: data.data.estimated_delivery_days?.toString() || '',
            estimatedDeliveryDate: data.data.estimated_delivery_date || '',
            followUpMessage: data.data.follow_up_message || '',
          })
        }
      } catch { /* ignore */ } finally { setLoading(false) }
    }
    if (params.id) fetchOrder()
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!order) {
    return <div className="text-center py-12">الطلب غير موجود</div>
  }

  const reviewPayment = async (paymentStatus: 'paid' | 'rejected') => {
    setSaving(true)
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: paymentStatus === 'paid' ? 'confirmed' : order.status,
          paymentStatus,
          paymentReviewNotes: paymentStatus === 'paid' ? 'تمت مراجعة الدفع وقبوله' : 'تم رفض الدفع، يرجى مراجعة البيانات',
        }),
      })
      const data = await res.json()
      if (data.success) setOrder((current) => current ? { ...current, ...data.data } : current)
    } finally {
      setSaving(false)
    }
  }

  const saveFollowUp = async () => {
    if (!order) return
    setSaving(true)
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: order.status,
          estimatedDeliveryDays: followUp.estimatedDeliveryDays ? Number(followUp.estimatedDeliveryDays) : null,
          estimatedDeliveryDate: followUp.estimatedDeliveryDate || null,
          followUpMessage: followUp.followUpMessage || null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setOrder((current) => current ? { ...current, ...data.data } : current)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/orders"><ArrowLeft className="h-4 w-4 ml-1" /> رجوع</Link>
        </Button>
        <h1 className="text-3xl font-bold">{order.order_number}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>معلومات العميل</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-medium">الاسم:</span> {order.customer_name}</p>
            <p><span className="font-medium">الهاتف:</span> {order.customer_phone}</p>
            <p><span className="font-medium">الولاية:</span> {order.wilaya}</p>
            <p><span className="font-medium">البلدية:</span> {order.commune}</p>
            <p><span className="font-medium">العنوان:</span> {order.delivery_address}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>حالة الطلب</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-medium">الحالة:</span> <Badge>{statusLabels[order.status]}</Badge></p>
            <p><span className="font-medium">طريقة الدفع:</span> {order.payment_method}</p>
            <p><span className="font-medium">حالة الدفع:</span> {paymentLabels[order.payment_status] || order.payment_status}</p>
            <p><span className="font-medium">رقم التتبع:</span> {order.tracking_number || '-'}</p>
            <p><span className="font-medium">رقم العملية:</span> {order.payment_transaction_id || '-'}</p>
            <p><span className="font-medium">ملاحظات مراجعة الدفع:</span> {order.payment_review_notes || '-'}</p>
            {order.payment_receipt_url ? (
              <div className="mt-4 space-y-3">
                <p className="font-medium">وصل الدفع</p>
                <div className="relative h-64 overflow-hidden rounded-lg border">
                  <Image src={order.payment_receipt_url} alt="وصل الدفع" fill className="object-contain bg-white" />
                </div>
                <div className="flex gap-3">
                  <Button disabled={saving || order.payment_status === 'paid'} onClick={() => reviewPayment('paid')}>قبول الدفع</Button>
                  <Button variant="outline" disabled={saving || order.payment_status === 'rejected'} onClick={() => reviewPayment('rejected')}>رفض الدفع</Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>متابعة الطلب</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">عدد أيام التوصيل</label>
            <input
              type="number"
              min={0}
              max={60}
              className="min-h-[48px] w-full rounded-2xl border border-border bg-white px-4 text-foreground"
              value={followUp.estimatedDeliveryDays}
              onChange={(e) => setFollowUp({ ...followUp, estimatedDeliveryDays: e.target.value })}
              placeholder="3"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">تاريخ الوصول المتوقع</label>
            <input
              type="date"
              className="min-h-[48px] w-full rounded-2xl border border-border bg-white px-4 text-foreground"
              value={followUp.estimatedDeliveryDate}
              onChange={(e) => setFollowUp({ ...followUp, estimatedDeliveryDate: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-3">
            <label className="text-sm font-medium text-foreground">رسالة المتابعة للعميل</label>
            <textarea
              rows={4}
              className="w-full rounded-[20px] border border-border bg-white px-4 py-3 text-foreground"
              value={followUp.followUpMessage}
              onChange={(e) => setFollowUp({ ...followUp, followUpMessage: e.target.value })}
              placeholder="الطلب قيد التحضير وسوف يتم التسليم خلال..."
            />
          </div>
          <div className="md:col-span-3">
            <Button onClick={saveFollowUp} disabled={saving}>
              {saving ? 'جاري الحفظ...' : 'حفظ المتابعة'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>عناصر الطلب</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-right font-medium">المنتج</th>
                <th className="px-4 py-3 text-right font-medium">الكمية</th>
                <th className="px-4 py-3 text-right font-medium">السعر</th>
                <th className="px-4 py-3 text-right font-medium">المجموع</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3">{item.product_name_ar}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">{item.unit_price.toLocaleString()} د.ج</td>
                  <td className="px-4 py-3">{item.total_price.toLocaleString()} د.ج</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between"><span>المجموع الفرعي</span><span>{order.subtotal.toLocaleString()} د.ج</span></div>
            <div className="flex justify-between"><span>التوصيل</span><span>{order.delivery_fee.toLocaleString()} د.ج</span></div>
            <div className="flex justify-between font-bold text-lg"><span>الإجمالي</span><span>{order.total.toLocaleString()} د.ج</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
