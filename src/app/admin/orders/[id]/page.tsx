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
import { useUIStore } from '@/stores/ui-store'
import { formatPrice } from '@/lib/utils/format'

export default function AdminOrderDetailPage() {
  const params = useParams()
  const locale = useUIStore((state) => state.locale)
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [followUp, setFollowUp] = useState({
    estimatedDeliveryDays: '',
    estimatedDeliveryDate: '',
    followUpMessage: '',
  })
  const statusLabels: Record<string, string> = locale === 'ar'
    ? { pending: 'قيد الانتظار', confirmed: 'مؤكد', processing: 'قيد المعالجة', shipped: 'تم الشحن', delivered: 'تم التوصيل', cancelled: 'ملغى' }
    : { pending: 'Pending', confirmed: 'Confirmed', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' }
  const paymentLabels: Record<string, string> = locale === 'ar'
    ? { pending: 'بانتظار الدفع', submitted: 'إثبات مرفوع بانتظار المراجعة', paid: 'تم قبول الدفع', rejected: 'تم رفض الدفع', failed: 'فشل', refunded: 'مسترجع' }
    : { pending: 'Pending payment', submitted: 'Proof uploaded and under review', paid: 'Payment accepted', rejected: 'Payment rejected', failed: 'Failed', refunded: 'Refunded' }
  const copy = locale === 'ar'
    ? {
        back: 'رجوع',
        notFound: 'الطلب غير موجود',
        customerInfo: 'معلومات العميل',
        name: 'الاسم',
        phone: 'الهاتف',
        wilaya: 'الولاية',
        commune: 'البلدية',
        address: 'العنوان',
        orderStatus: 'حالة الطلب',
        status: 'الحالة',
        paymentMethod: 'طريقة الدفع',
        paymentStatus: 'حالة الدفع',
        trackingNumber: 'رقم التتبع',
        transactionId: 'رقم العملية',
        reviewNotes: 'ملاحظات مراجعة الدفع',
        paymentProof: 'وصل الدفع',
        approvePayment: 'قبول الدفع',
        rejectPayment: 'رفض الدفع',
        followUp: 'متابعة الطلب',
        deliveryDays: 'عدد أيام التوصيل',
        estimatedDate: 'تاريخ الوصول المتوقع',
        customerMessage: 'رسالة المتابعة للعميل',
        followUpPlaceholder: 'الطلب قيد التحضير وسوف يتم التسليم خلال...',
        save: 'حفظ المتابعة',
        saving: 'جاري الحفظ...',
        items: 'عناصر الطلب',
        product: 'المنتج',
        quantity: 'الكمية',
        price: 'السعر',
        total: 'المجموع',
        subtotal: 'المجموع الفرعي',
        delivery: 'التوصيل',
        grandTotal: 'الإجمالي',
      }
    : {
        back: 'Back',
        notFound: 'Order not found',
        customerInfo: 'Customer information',
        name: 'Name',
        phone: 'Phone',
        wilaya: 'Wilaya',
        commune: 'Commune',
        address: 'Address',
        orderStatus: 'Order status',
        status: 'Status',
        paymentMethod: 'Payment method',
        paymentStatus: 'Payment status',
        trackingNumber: 'Tracking number',
        transactionId: 'Transaction ID',
        reviewNotes: 'Payment review notes',
        paymentProof: 'Payment proof',
        approvePayment: 'Approve payment',
        rejectPayment: 'Reject payment',
        followUp: 'Order follow-up',
        deliveryDays: 'Delivery days',
        estimatedDate: 'Estimated arrival date',
        customerMessage: 'Follow-up message for the customer',
        followUpPlaceholder: 'The order is being prepared and will be delivered within...',
        save: 'Save follow-up',
        saving: 'Saving...',
        items: 'Order items',
        product: 'Product',
        quantity: 'Quantity',
        price: 'Price',
        total: 'Total',
        subtotal: 'Subtotal',
        delivery: 'Delivery',
        grandTotal: 'Grand total',
      }

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
    return <div className="text-center py-12">{copy.notFound}</div>
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
          paymentReviewNotes: paymentStatus === 'paid'
            ? (locale === 'ar' ? 'تمت مراجعة الدفع وقبوله' : 'Payment reviewed and accepted')
            : (locale === 'ar' ? 'تم رفض الدفع، يرجى مراجعة البيانات' : 'Payment rejected. Please review the submitted details.'),
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
          <Link href="/admin/orders"><ArrowLeft className="h-4 w-4 ml-1" /> {copy.back}</Link>
        </Button>
        <h1 className="text-3xl font-bold">{order.order_number}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>{copy.customerInfo}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-medium">{copy.name}:</span> {order.customer_name}</p>
            <p><span className="font-medium">{copy.phone}:</span> {order.customer_phone}</p>
            <p><span className="font-medium">{copy.wilaya}:</span> {order.wilaya}</p>
            <p><span className="font-medium">{copy.commune}:</span> {order.commune}</p>
            <p><span className="font-medium">{copy.address}:</span> {order.delivery_address}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{copy.orderStatus}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-medium">{copy.status}:</span> <Badge>{statusLabels[order.status]}</Badge></p>
            <p><span className="font-medium">{copy.paymentMethod}:</span> {order.payment_method}</p>
            <p><span className="font-medium">{copy.paymentStatus}:</span> {paymentLabels[order.payment_status] || order.payment_status}</p>
            <p><span className="font-medium">{copy.trackingNumber}:</span> {order.tracking_number || '-'}</p>
            <p><span className="font-medium">{copy.transactionId}:</span> {order.payment_transaction_id || '-'}</p>
            <p><span className="font-medium">{copy.reviewNotes}:</span> {order.payment_review_notes || '-'}</p>
            {order.payment_receipt_url ? (
              <div className="mt-4 space-y-3">
                <p className="font-medium">{copy.paymentProof}</p>
                <div className="relative h-64 overflow-hidden rounded-lg border">
                  <Image src={order.payment_receipt_url} alt={copy.paymentProof} fill className="object-contain bg-white" />
                </div>
                <div className="flex gap-3">
                  <Button disabled={saving || order.payment_status === 'paid'} onClick={() => reviewPayment('paid')}>{copy.approvePayment}</Button>
                  <Button variant="outline" disabled={saving || order.payment_status === 'rejected'} onClick={() => reviewPayment('rejected')}>{copy.rejectPayment}</Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{copy.followUp}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{copy.deliveryDays}</label>
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
            <label className="text-sm font-medium text-foreground">{copy.estimatedDate}</label>
            <input
              type="date"
              className="min-h-[48px] w-full rounded-2xl border border-border bg-white px-4 text-foreground"
              value={followUp.estimatedDeliveryDate}
              onChange={(e) => setFollowUp({ ...followUp, estimatedDeliveryDate: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-3">
            <label className="text-sm font-medium text-foreground">{copy.customerMessage}</label>
            <textarea
              rows={4}
              className="w-full rounded-[20px] border border-border bg-white px-4 py-3 text-foreground"
              value={followUp.followUpMessage}
              onChange={(e) => setFollowUp({ ...followUp, followUpMessage: e.target.value })}
              placeholder={copy.followUpPlaceholder}
            />
          </div>
          <div className="md:col-span-3">
            <Button onClick={saveFollowUp} disabled={saving}>{saving ? copy.saving : copy.save}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{copy.items}</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-right font-medium">{copy.product}</th>
                <th className="px-4 py-3 text-right font-medium">{copy.quantity}</th>
                <th className="px-4 py-3 text-right font-medium">{copy.price}</th>
                <th className="px-4 py-3 text-right font-medium">{copy.total}</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3">{item.product_name_ar}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3"><bdi>{formatPrice(item.unit_price, 'DZD', locale)}</bdi></td>
                  <td className="px-4 py-3"><bdi>{formatPrice(item.total_price, 'DZD', locale)}</bdi></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between"><span>{copy.subtotal}</span><span><bdi>{formatPrice(order.subtotal, 'DZD', locale)}</bdi></span></div>
            <div className="flex justify-between"><span>{copy.delivery}</span><span><bdi>{formatPrice(order.delivery_fee, 'DZD', locale)}</bdi></span></div>
            <div className="flex justify-between font-bold text-lg"><span>{copy.grandTotal}</span><span><bdi>{formatPrice(order.total, 'DZD', locale)}</bdi></span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
