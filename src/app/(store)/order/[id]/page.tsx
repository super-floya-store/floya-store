'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Upload, Copy, Check } from 'lucide-react'

const paymentLabels: Record<string, string> = {
  pending: 'بانتظار رفع إثبات الدفع',
  submitted: 'تم رفع إثبات الدفع وهو قيد المراجعة',
  paid: 'تم قبول الدفع',
  rejected: 'تم رفض الدفع، يرجى رفع إثبات صحيح',
  failed: 'فشل',
  refunded: 'مسترجع',
}

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  const [message, setMessage] = useState('')
  const [selectedFileName, setSelectedFileName] = useState('')
  const [copiedRip, setCopiedRip] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const ripValue = '00799999004419717033'

  useEffect(() => {
    fetch(`/api/orders/track/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrder(data.data)
      })
      .finally(() => setLoading(false))
  }, [params.id])

  const uploadProof = async (file: File) => {
    setUploading(true)
    setMessage('')
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('transactionId', transactionId)
      const res = await fetch(`/api/orders/track/${params.id}/payment-proof`, { method: 'POST', body })
      const data = await res.json()
      if (data.success) {
        setOrder(data.data)
        setMessage('تم رفع إثبات الدفع بنجاح.')
      } else {
        setMessage(data.error?.message || 'تعذر رفع الإثبات.')
      }
    } finally {
      setUploading(false)
    }
  }

  const handleCopyRip = async () => {
    try {
      await navigator.clipboard.writeText(ripValue)
      setCopiedRip(true)
      window.setTimeout(() => setCopiedRip(false), 1800)
    } catch {
      // ignore
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 md:px-6">
      <Card className="surface-card overflow-hidden rounded-[36px] border-white/70 text-center shadow-heavy">
        <CardContent className="py-14">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-soft">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-secondary">تم تأكيد طلبك!</h1>
          <p className="mb-4 mt-3 text-muted-foreground">
            رقم الطلب: <span className="font-bold text-foreground">{params.id}</span>
          </p>
          <p className="mx-auto max-w-xl text-sm leading-8 text-muted-foreground md:text-base">
            ارفعي الآن إثبات الدفع عبر BaridiMob، وبعد المراجعة سيتم تحديث حالة الطلب هنا مباشرة.
          </p>

          {!loading && order ? (
            <div className="mx-auto mt-8 grid max-w-2xl gap-6 text-right">
              <div className="rounded-[28px] border border-border bg-white/70 p-5">
                <p className="text-sm text-muted-foreground">حالة الدفع</p>
                <p className="mt-2 text-lg font-bold text-foreground">{paymentLabels[order.payment_status] || order.payment_status}</p>
                <p className="mt-3 text-sm text-muted-foreground">حالة الطلب: <span className="font-semibold text-foreground">{order.status}</span></p>
                {order.tracking_number ? <p className="mt-2 text-sm text-muted-foreground">رقم التتبع: <span className="font-semibold text-foreground">{order.tracking_number}</span></p> : null}
              </div>

              <div className="rounded-[28px] border border-border bg-white/70 p-5">
                <label htmlFor="transaction-id" className="mb-2 block text-sm font-medium text-foreground">رقم العملية</label>
                <input id="transaction-id" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="min-h-[48px] w-full rounded-2xl border border-border bg-white px-4 text-foreground" />
                <div className="mt-4 rounded-[22px] border border-border bg-white p-4">
                  <p className="mb-3 text-sm font-medium text-foreground">صورة وصل الدفع</p>
                  <input
                    ref={fileInputRef}
                    id="receipt-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading || !transactionId.trim()}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setSelectedFileName(file.name)
                        uploadProof(file)
                      }
                    }}
                  />
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <Button
                      type="button"
                      className="min-h-[48px] rounded-full px-5"
                      disabled={uploading || !transactionId.trim()}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="ml-2 h-4 w-4" />
                      اختر صورة الوصل
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {selectedFileName || 'PNG أو JPG بحجم واضح'}
                    </span>
                  </div>
                  {transactionId.trim() ? (
                    <p className="mt-3 text-xs text-muted-foreground">بعد اختيار الصورة سيتم رفعها مباشرة.</p>
                  ) : (
                    <p className="mt-3 text-xs text-muted-foreground">أدخلي رقم العملية أولاً لتفعيل رفع الصورة.</p>
                  )}
                </div>
                {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
              </div>

              <div className="rounded-[28px] border border-primary/15 bg-white/85 p-5 text-right">
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">RIP</p>
                <p className="mt-2 whitespace-nowrap overflow-x-auto text-lg font-extrabold tracking-[0.14em] text-black sm:text-xl md:text-2xl">
                  {ripValue}
                </p>
                <Button type="button" variant="outline" className="mt-4 min-h-[48px] rounded-full border-border bg-white px-5 text-sm font-semibold text-foreground" onClick={handleCopyRip}>
                  {copiedRip ? <Check className="ml-2 h-4 w-4" /> : <Copy className="ml-2 h-4 w-4" />}
                  {copiedRip ? 'تم النسخ' : 'نسخ RIP'}
                </Button>
              </div>

              {order.payment_receipt_url ? (
                <div className="rounded-[28px] border border-border bg-white/70 p-5">
                  <p className="mb-3 text-sm font-medium text-foreground">الوصل المرفوع</p>
                  <div className="relative h-72 overflow-hidden rounded-2xl border bg-white">
                    <Image src={order.payment_receipt_url} alt="وصل الدفع" fill className="object-contain" />
                  </div>
                </div>
              ) : null}

              {(order.payment_status === 'paid' || order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') ? (
                <div className="rounded-[28px] border border-primary/15 bg-white/90 p-5">
                  <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">متابعة الطلب</p>
                  <h2 className="mt-2 text-2xl font-bold text-foreground">
                    {order.status === 'delivered'
                      ? 'تم تسليم الطلب'
                      : order.status === 'shipped'
                        ? 'الطلب في الشحن'
                        : order.status === 'processing'
                          ? 'الطلب قيد التحضير'
                          : 'الطلب تم تأكيده وجارٍ المتابعة'}
                  </h2>
                  <p className="mt-3 text-sm leading-8 text-muted-foreground">
                    بعد قبول الدفع تظهر هنا حالة الطلب وتقدير الوصول حتى تكوني على علم دائم بمكان المنتج.
                  </p>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {[
                      { label: 'المرحلة الحالية', value: order.status === 'confirmed' ? 'تم قبول الدفع' : order.status === 'processing' ? 'قيد التحضير' : order.status === 'shipped' ? 'في الشحن' : order.status === 'delivered' ? 'تم التسليم' : 'بإنتظار التأكيد' },
                      {
                        label: 'تقدير الوصول',
                        value: order.estimated_delivery_date
                          ? new Date(order.estimated_delivery_date).toLocaleDateString('ar-DZ')
                          : order.estimated_delivery_days
                            ? `خلال ${order.estimated_delivery_days} يوم`
                            : 'سيتم تحديده بعد قبول الدفع',
                      },
                      {
                        label: 'رسالة المتابعة',
                        value: order.follow_up_message || 'يمكنك مراسلة البائع في أي وقت عبر صفحة التواصل.',
                      },
                      { label: 'طريقة التواصل', value: 'إرسال رسالة للبائع' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-[22px] border border-border bg-background px-4 py-4">
                        <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">{item.label}</p>
                        <p className="mt-2 text-base font-bold leading-7 text-foreground">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Button asChild className="min-h-[48px] rounded-full px-5">
                      <a href="/contact">مراسلة البائع</a>
                    </Button>
                    <Button asChild variant="outline" className="min-h-[48px] rounded-full px-5">
                      <a href="/products">متابعة التسوق</a>
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8">
            <Button asChild className="rounded-full px-6">
              <a href="/products">متابعة التسوق</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
