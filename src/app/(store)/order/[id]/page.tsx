'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { CheckCircle, Upload, Copy, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const paymentLabels: Record<string, string> = {
  pending: 'بانتظار الدفع أو المراجعة',
  submitted: 'تم رفع الإثبات وهو قيد المراجعة',
  paid: 'تم قبول الدفع',
  rejected: 'تم رفض الدفع، يرجى رفع إثبات صحيح',
  failed: 'فشل',
  refunded: 'مسترجع',
}

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  const [message, setMessage] = useState('')
  const [selectedFileName, setSelectedFileName] = useState('')
  const [copiedValue, setCopiedValue] = useState<'rip' | 'wallet' | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    fetch(`/api/orders/track/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrder(data.data)
      })
      .finally(() => setLoading(false))

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSettings(data.data)
      })
      .catch(() => {})
  }, [params.id])

  const ripValue = settings?.baridimob_rip || '00799999004419717033'
  const binanceAddress = settings?.binance_wallet_address || ''
  const needsProof = order?.payment_method === 'baridimob' || order?.payment_method === 'binance'
  const paymentMethodLabel = order?.payment_method === 'cod'
    ? 'الدفع عند الاستلام'
    : order?.payment_method === 'binance'
      ? 'Binance / USDT'
      : 'BaridiMob'

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

  const handleCopy = async (value: string, type: 'rip' | 'wallet') => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedValue(type)
      window.setTimeout(() => setCopiedValue(null), 1800)
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
            {needsProof
              ? `ارفع الآن إثبات الدفع عبر ${paymentMethodLabel}، وبعد المراجعة سيتم تحديث حالة الطلب هنا مباشرة.`
              : 'طلبك مسجل بنجاح. بما أنك اخترت الدفع عند الاستلام فلا حاجة إلى رفع إثبات دفع، وسيتم تحديث حالة الطلب هنا مباشرة.'}
          </p>

          {!loading && order ? (
            <div className="mx-auto mt-8 grid max-w-2xl gap-6 text-right">
              <div className="rounded-[28px] border border-border bg-white/70 p-5">
                <p className="text-sm text-muted-foreground">حالة الدفع</p>
                <p className="mt-2 text-lg font-bold text-foreground">{paymentLabels[order.payment_status] || order.payment_status}</p>
                <p className="mt-3 text-sm text-muted-foreground">طريقة الدفع: <span className="font-semibold text-foreground">{paymentMethodLabel}</span></p>
                <p className="mt-3 text-sm text-muted-foreground">حالة الطلب: <span className="font-semibold text-foreground">{order.status}</span></p>
                {order.tracking_number ? <p className="mt-2 text-sm text-muted-foreground">رقم التتبع: <span className="font-semibold text-foreground">{order.tracking_number}</span></p> : null}
              </div>

              {needsProof ? (
                <div className="rounded-[28px] border border-border bg-white/70 p-5">
                  <label htmlFor="transaction-id" className="mb-2 block text-sm font-medium text-foreground">رقم العملية / التحويل</label>
                  <input id="transaction-id" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="min-h-[48px] w-full rounded-2xl border border-border bg-white px-4 text-foreground" />
                  <div className="mt-4 rounded-[22px] border border-border bg-white p-4">
                    <p className="mb-3 text-sm font-medium text-foreground">صورة إثبات الدفع</p>
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
                      <Button type="button" className="min-h-[48px] rounded-full px-5" disabled={uploading || !transactionId.trim()} onClick={() => fileInputRef.current?.click()}>
                        <Upload className="ml-2 h-4 w-4" />
                        اختر صورة الإثبات
                      </Button>
                      <span className="text-sm text-muted-foreground">{selectedFileName || 'PNG أو JPG بحجم واضح'}</span>
                    </div>
                    {transactionId.trim()
                      ? <p className="mt-3 text-xs text-muted-foreground">بعد اختيار الصورة سيتم رفعها مباشرة.</p>
                      : <p className="mt-3 text-xs text-muted-foreground">أدخل رقم العملية أو التحويل أولاً لتفعيل رفع الصورة.</p>}
                  </div>
                  {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
                </div>
              ) : null}

              {order.payment_method === 'baridimob' ? (
                <div className="rounded-[28px] border border-primary/15 bg-white/85 p-5 text-right">
                  <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">RIP</p>
                  <p className="mt-2 whitespace-nowrap overflow-x-auto text-lg font-extrabold tracking-[0.14em] text-black sm:text-xl md:text-2xl">{ripValue}</p>
                  <Button type="button" variant="outline" className="mt-4 min-h-[48px] rounded-full border-border bg-white px-5 text-sm font-semibold text-foreground" onClick={() => handleCopy(ripValue, 'rip')}>
                    {copiedValue === 'rip' ? <Check className="ml-2 h-4 w-4" /> : <Copy className="ml-2 h-4 w-4" />}
                    {copiedValue === 'rip' ? 'تم النسخ' : 'نسخ RIP'}
                  </Button>
                </div>
              ) : null}

              {order.payment_method === 'binance' && binanceAddress ? (
                <div className="rounded-[28px] border border-primary/15 bg-white/85 p-5 text-right">
                  <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">USDT Wallet</p>
                  <p className="mt-2 overflow-x-auto text-sm font-extrabold text-black md:text-base">{binanceAddress}</p>
                  <Button type="button" variant="outline" className="mt-4 min-h-[48px] rounded-full border-border bg-white px-5 text-sm font-semibold text-foreground" onClick={() => handleCopy(binanceAddress, 'wallet')}>
                    {copiedValue === 'wallet' ? <Check className="ml-2 h-4 w-4" /> : <Copy className="ml-2 h-4 w-4" />}
                    {copiedValue === 'wallet' ? 'تم النسخ' : 'نسخ العنوان'}
                  </Button>
                </div>
              ) : null}

              {order.payment_receipt_url ? (
                <div className="rounded-[28px] border border-border bg-white/70 p-5">
                  <p className="mb-3 text-sm font-medium text-foreground">الإثبات المرفوع</p>
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
                    بعد قبول الدفع تظهر هنا حالة الطلب وتقدير الوصول حتى تكون على علم دائم بمكان المنتج.
                  </p>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {[
                      { label: 'المرحلة الحالية', value: order.status === 'confirmed' ? 'تم قبول الدفع' : order.status === 'processing' ? 'قيد التحضير' : order.status === 'shipped' ? 'في الشحن' : order.status === 'delivered' ? 'تم التسليم' : 'بانتظار التأكيد' },
                      {
                        label: 'تقدير الوصول',
                        value: order.estimated_delivery_date
                          ? new Date(order.estimated_delivery_date).toLocaleDateString('ar-DZ')
                          : order.estimated_delivery_days
                            ? `خلال ${order.estimated_delivery_days} يوم`
                            : 'سيتم تحديده بعد قبول الدفع',
                      },
                      { label: 'رسالة المتابعة', value: order.follow_up_message || 'يمكنك مراسلة البائع في أي وقت عبر صفحة التواصل.' },
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
