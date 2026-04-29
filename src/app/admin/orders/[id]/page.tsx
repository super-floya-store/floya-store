'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminEmptyState, AdminPageHeader, AdminPanel } from '@/components/admin/AdminShell'
import { useUIStore } from '@/stores/ui-store'
import { formatPrice } from '@/lib/utils/format'
import type { OrderWithItems } from '@/types/order'

export default function AdminOrderDetailPage() {
  const params = useParams()
  const locale = useUIStore((state) => state.locale)
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
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
        eyebrow: 'مراجعة الطلبات',
        title: 'تفاصيل الطلب',
        description: 'عرض موحد لمعلومات العميل والدفع والمتابعة التشغيلية والعناصر المشتراة.',
        back: 'العودة للطلبات',
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
        approvedMessage: 'تم قبول الدفع وتحديث الطلب.',
        rejectedMessage: 'تم رفض الدفع وتحديث الطلب.',
        followupSaved: 'تم حفظ متابعة الطلب.',
        failed: 'تعذر تحديث بيانات الطلب',
      }
    : {
        eyebrow: 'Order review',
        title: 'Order detail',
        description: 'Unified view of customer information, payment state, operational follow-up, and purchased items.',
        back: 'Back to orders',
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
        approvedMessage: 'Payment accepted and order updated.',
        rejectedMessage: 'Payment rejected and order updated.',
        followupSaved: 'Order follow-up saved.',
        failed: 'Unable to update the order',
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
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchOrder()
  }, [params.id])

  const reviewPayment = async (paymentStatus: 'paid' | 'rejected') => {
    if (!order) return
    setSaving(true)
    setError('')
    setMessage('')
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
      if (data.success) {
        setOrder((current) => current ? { ...current, ...data.data } : current)
        setMessage(paymentStatus === 'paid' ? copy.approvedMessage : copy.rejectedMessage)
      } else {
        setError(data.error?.message || copy.failed)
      }
    } finally {
      setSaving(false)
    }
  }

  const saveFollowUp = async () => {
    if (!order) return
    setSaving(true)
    setError('')
    setMessage('')
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
        setMessage(copy.followupSaved)
      } else {
        setError(data.error?.message || copy.failed)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
        <Skeleton className="h-96 rounded-[28px]" />
      </div>
    )
  }

  if (!order) {
    return <AdminEmptyState title={copy.notFound} />
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={`${copy.title} • ${order.order_number}`}
        description={copy.description}
        actions={(
          <Button variant="outline" asChild className="rounded-full">
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4" />
              {copy.back}
            </Link>
          </Button>
        )}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AdminPanel title={copy.customerInfo}>
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <p><span className="font-medium">{copy.name}:</span> {order.customer_name}</p>
            <p><span className="font-medium">{copy.phone}:</span> {order.customer_phone}</p>
            <p><span className="font-medium">{copy.wilaya}:</span> {order.wilaya}</p>
            <p><span className="font-medium">{copy.commune}:</span> {order.commune}</p>
            <p className="md:col-span-2"><span className="font-medium">{copy.address}:</span> {order.delivery_address}</p>
          </div>
        </AdminPanel>

        <AdminPanel title={copy.orderStatus}>
          <div className="space-y-3 text-sm">
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
                <div className="flex flex-wrap gap-3">
                  <Button disabled={saving || order.payment_status === 'paid'} onClick={() => reviewPayment('paid')}>{copy.approvePayment}</Button>
                  <Button variant="outline" disabled={saving || order.payment_status === 'rejected'} onClick={() => reviewPayment('rejected')}>{copy.rejectPayment}</Button>
                </div>
              </div>
            ) : null}
          </div>
        </AdminPanel>
      </div>

      <AdminPanel title={copy.followUp}>
        <div className="grid gap-4 md:grid-cols-3">
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
          <div className="md:col-span-3 flex flex-wrap items-center gap-4">
            <Button onClick={saveFollowUp} disabled={saving}>{saving ? copy.saving : copy.save}</Button>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? <p className="text-sm text-green-600">{message}</p> : null}
          </div>
        </div>
      </AdminPanel>

      <AdminPanel title={copy.items} className="overflow-hidden" contentClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-4 py-4 text-right font-medium">{copy.product}</th>
                <th className="px-4 py-4 text-right font-medium">{copy.quantity}</th>
                <th className="px-4 py-4 text-right font-medium">{copy.price}</th>
                <th className="px-4 py-4 text-right font-medium">{copy.total}</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item.id} className="border-t border-border/70">
                  <td className="px-4 py-4">{locale === 'ar' ? item.product_name_ar : item.product_name_en}</td>
                  <td className="px-4 py-4">{item.quantity}</td>
                  <td className="px-4 py-4"><bdi>{formatPrice(item.unit_price, 'DZD', locale)}</bdi></td>
                  <td className="px-4 py-4"><bdi>{formatPrice(item.total_price, 'DZD', locale)}</bdi></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border/70 p-4">
          <div className="space-y-2">
            <div className="flex justify-between"><span>{copy.subtotal}</span><span><bdi>{formatPrice(order.subtotal, 'DZD', locale)}</bdi></span></div>
            <div className="flex justify-between"><span>{copy.delivery}</span><span><bdi>{formatPrice(order.delivery_fee, 'DZD', locale)}</bdi></span></div>
            <div className="flex justify-between text-lg font-bold"><span>{copy.grandTotal}</span><span><bdi>{formatPrice(order.total, 'DZD', locale)}</bdi></span></div>
          </div>
        </div>
      </AdminPanel>
    </div>
  )
}
