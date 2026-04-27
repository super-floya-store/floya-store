'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { CheckCircle, Upload, Copy, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { normalizeProductType } from '@/types/cart'
import { useUIStore } from '@/stores/ui-store'

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const locale = useUIStore((state) => state.locale)
  const [order, setOrder] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  const [message, setMessage] = useState('')
  const [selectedFileName, setSelectedFileName] = useState('')
  const [copiedValue, setCopiedValue] = useState<'rip' | 'wallet' | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const copy = locale === 'ar'
    ? {
        title: 'تم تأكيد طلبك!',
        orderNumber: 'رقم الطلب',
        paymentStatus: 'حالة الدفع',
        paymentMethod: 'طريقة الدفع',
        orderStatus: 'حالة الطلب',
        tracking: 'رقم التتبع',
        digitalOnly: 'هذا الطلب رقمي فقط وسيتم تسليمه عبر بيانات التواصل أو الحساب التي أدخلتها أثناء الطلب.',
        items: 'المنتجات',
        quantity: 'الكمية',
        digital: 'رقمي',
        physical: 'مادي',
        variant: 'النسخة',
        transactionId: 'رقم العملية / التحويل',
        proofImage: 'صورة إثبات الدفع',
        chooseProof: 'اختر صورة الإثبات',
        proofHint: 'PNG أو JPG بحجم واضح',
        proofAuto: 'بعد اختيار الصورة سيتم رفعها مباشرة.',
        proofNeedsId: 'أدخل رقم العملية أو التحويل أولاً لتفعيل رفع الصورة.',
        copied: 'تم النسخ',
        copyRip: 'نسخ RIP',
        copyWallet: 'نسخ العنوان',
        uploadedProof: 'الإثبات المرفوع',
        followUp: 'متابعة الطلب',
        delivered: 'تم تسليم الطلب',
        shipped: 'الطلب في الشحن',
        processing: 'الطلب قيد التحضير',
        confirmed: 'الطلب تم تأكيده وجارٍ المتابعة',
        followUpBody: 'بعد قبول الدفع تظهر هنا حالة الطلب وتقدير الوصول حتى تكون على علم دائم بمكان المنتج.',
        currentStage: 'المرحلة الحالية',
        eta: 'تقدير الوصول',
        followUpMessage: 'رسالة المتابعة',
        etaFallback: 'سيتم تحديده بعد قبول الدفع',
        contactSeller: 'مراسلة البائع',
        continueShopping: 'متابعة التسوق',
        proofSuccess: 'تم رفع إثبات الدفع بنجاح.',
        proofFailure: 'تعذر رفع الإثبات.',
        payNowBody: 'ارفع الآن إثبات الدفع عبر',
        codBody: 'طلبك مسجل بنجاح. بما أنك اخترت الدفع عند الاستلام فلا حاجة إلى رفع إثبات دفع، وسيتم تحديث حالة الطلب هنا مباشرة.',
        pending: 'بانتظار الدفع أو المراجعة',
        submitted: 'تم رفع الإثبات وهو قيد المراجعة',
        paid: 'تم قبول الدفع',
        rejected: 'تم رفض الدفع، يرجى رفع إثبات صحيح',
        failed: 'فشل',
        refunded: 'مسترجع',
      }
    : {
        title: 'Your order is confirmed!',
        orderNumber: 'Order number',
        paymentStatus: 'Payment status',
        paymentMethod: 'Payment method',
        orderStatus: 'Order status',
        tracking: 'Tracking number',
        digitalOnly: 'This is a digital-only order and it will be delivered using the contact or account details you entered at checkout.',
        items: 'Items',
        quantity: 'Quantity',
        digital: 'Digital',
        physical: 'Physical',
        variant: 'Variant',
        transactionId: 'Transaction / transfer reference',
        proofImage: 'Payment proof image',
        chooseProof: 'Choose proof image',
        proofHint: 'PNG or JPG with clear details',
        proofAuto: 'The image uploads immediately after you choose it.',
        proofNeedsId: 'Enter the transaction or transfer reference first to enable upload.',
        copied: 'Copied',
        copyRip: 'Copy RIP',
        copyWallet: 'Copy address',
        uploadedProof: 'Uploaded proof',
        followUp: 'Order follow-up',
        delivered: 'Order delivered',
        shipped: 'Order in transit',
        processing: 'Order is being prepared',
        confirmed: 'Payment accepted and order is being processed',
        followUpBody: 'After payment is accepted, this section shows the live order stage and estimated arrival.',
        currentStage: 'Current stage',
        eta: 'Estimated arrival',
        followUpMessage: 'Follow-up message',
        etaFallback: 'It will be set after payment is accepted',
        contactSeller: 'Contact seller',
        continueShopping: 'Continue shopping',
        proofSuccess: 'Payment proof uploaded successfully.',
        proofFailure: 'Unable to upload payment proof.',
        payNowBody: 'Upload your payment proof now via',
        codBody: 'Your order is registered successfully. Since you selected cash on delivery, no payment proof is required and the status will update here directly.',
        pending: 'Waiting for payment or review',
        submitted: 'Proof uploaded and under review',
        paid: 'Payment accepted',
        rejected: 'Payment rejected, upload a valid proof',
        failed: 'Failed',
        refunded: 'Refunded',
      }

  const paymentLabels: Record<string, string> = {
    pending: copy.pending,
    submitted: copy.submitted,
    paid: copy.paid,
    rejected: copy.rejected,
    failed: copy.failed,
    refunded: copy.refunded,
  }

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
  const isDigitalOnly = Array.isArray(order?.items) && order.items.length > 0 && order.items.every((item: any) => normalizeProductType(item.product_type) === 'digital')
  const paymentMethodLabel = order?.payment_method === 'cod'
    ? (locale === 'ar' ? 'الدفع عند الاستلام' : 'Cash on delivery')
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
        setMessage(copy.proofSuccess)
      } else {
        setMessage(data.error?.message || copy.proofFailure)
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

  const statusHeadline = order?.status === 'delivered'
    ? copy.delivered
    : order?.status === 'shipped'
      ? copy.shipped
      : order?.status === 'processing'
        ? copy.processing
        : copy.confirmed

  const statusCardItems = [
    {
      label: copy.currentStage,
      value: order?.status === 'confirmed'
        ? copy.paid
        : order?.status === 'processing'
          ? copy.processing
          : order?.status === 'shipped'
            ? copy.shipped
            : order?.status === 'delivered'
              ? copy.delivered
              : copy.pending,
    },
    {
      label: copy.eta,
      value: order?.estimated_delivery_date
        ? new Date(order.estimated_delivery_date).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US')
        : order?.estimated_delivery_days
          ? locale === 'ar'
            ? `خلال ${order.estimated_delivery_days} يوم`
            : `Within ${order.estimated_delivery_days} days`
          : copy.etaFallback,
    },
    {
      label: copy.followUpMessage,
      value: order?.follow_up_message || (locale === 'ar' ? 'يمكنك مراسلة البائع في أي وقت عبر صفحة التواصل.' : 'You can contact the seller anytime from the contact page.'),
    },
  ]

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 md:px-6">
      <Card className="surface-card overflow-hidden rounded-[36px] border-white/70 text-center shadow-heavy">
        <CardContent className="py-14">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-soft">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-secondary">{copy.title}</h1>
          <p className="mb-4 mt-3 text-muted-foreground">
            {copy.orderNumber}: <span className="font-bold text-foreground">{params.id}</span>
          </p>
          <p className="mx-auto max-w-xl text-sm leading-8 text-muted-foreground md:text-base">
            {needsProof
              ? `${copy.payNowBody} ${paymentMethodLabel}${locale === 'ar' ? '، وبعد المراجعة سيتم تحديث حالة الطلب هنا مباشرة.' : ', then the status here will update after review.'}`
              : copy.codBody}
          </p>

          {!loading && order ? (
            <div className={`mx-auto mt-8 grid max-w-2xl gap-6 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className="rounded-[28px] border border-border bg-white/70 p-5">
                <p className="text-sm text-muted-foreground">{copy.paymentStatus}</p>
                <p className="mt-2 text-lg font-bold text-foreground">{paymentLabels[order.payment_status] || order.payment_status}</p>
                <p className="mt-3 text-sm text-muted-foreground">{copy.paymentMethod}: <span className="font-semibold text-foreground">{paymentMethodLabel}</span></p>
                <p className="mt-3 text-sm text-muted-foreground">{copy.orderStatus}: <span className="font-semibold text-foreground">{order.status}</span></p>
                {order.tracking_number ? <p className="mt-2 text-sm text-muted-foreground">{copy.tracking}: <span className="font-semibold text-foreground">{order.tracking_number}</span></p> : null}
                {isDigitalOnly ? <p className="mt-2 text-sm text-muted-foreground">{copy.digitalOnly}</p> : null}
              </div>

              {Array.isArray(order.items) && order.items.length > 0 ? (
                <div className="rounded-[28px] border border-border bg-white/70 p-5">
                  <p className="text-sm font-medium text-foreground">{copy.items}</p>
                  <div className="mt-4 space-y-3">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="rounded-[22px] border border-border bg-white px-4 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-bold text-foreground">{locale === 'ar' ? item.product_name_ar : item.product_name_en || item.product_name_ar}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{copy.quantity}: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-bold text-foreground">{Number(item.total_price).toLocaleString()} {locale === 'ar' ? 'د.ج' : 'DZD'}</p>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            {normalizeProductType(item.product_type) === 'digital' ? copy.digital : copy.physical}
                          </Badge>
                          {item.variant_label ? <Badge variant="outline">{copy.variant}: {item.variant_label}</Badge> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {needsProof ? (
                <div className="rounded-[28px] border border-border bg-white/70 p-5">
                  <label htmlFor="transaction-id" className="mb-2 block text-sm font-medium text-foreground">{copy.transactionId}</label>
                  <input id="transaction-id" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="min-h-[48px] w-full rounded-2xl border border-border bg-white px-4 text-foreground" />
                  <div className="mt-4 rounded-[22px] border border-border bg-white p-4">
                    <p className="mb-3 text-sm font-medium text-foreground">{copy.proofImage}</p>
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
                        {copy.chooseProof}
                      </Button>
                      <span className="text-sm text-muted-foreground">{selectedFileName || copy.proofHint}</span>
                    </div>
                    {transactionId.trim()
                      ? <p className="mt-3 text-xs text-muted-foreground">{copy.proofAuto}</p>
                      : <p className="mt-3 text-xs text-muted-foreground">{copy.proofNeedsId}</p>}
                  </div>
                  {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
                </div>
              ) : null}

              {order.payment_method === 'baridimob' ? (
                <div className={`rounded-[28px] border border-primary/15 bg-white/85 p-5 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                  <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">RIP</p>
                  <p className="mt-2 whitespace-nowrap overflow-x-auto text-lg font-extrabold tracking-[0.14em] text-black sm:text-xl md:text-2xl">{ripValue}</p>
                  <Button type="button" variant="outline" className="mt-4 min-h-[48px] rounded-full border-border bg-white px-5 text-sm font-semibold text-foreground" onClick={() => handleCopy(ripValue, 'rip')}>
                    {copiedValue === 'rip' ? <Check className="ml-2 h-4 w-4" /> : <Copy className="ml-2 h-4 w-4" />}
                    {copiedValue === 'rip' ? copy.copied : copy.copyRip}
                  </Button>
                </div>
              ) : null}

              {order.payment_method === 'binance' && binanceAddress ? (
                <div className={`rounded-[28px] border border-primary/15 bg-white/85 p-5 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                  <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">USDT Wallet</p>
                  <p className="mt-2 overflow-x-auto text-sm font-extrabold text-black md:text-base">{binanceAddress}</p>
                  <Button type="button" variant="outline" className="mt-4 min-h-[48px] rounded-full border-border bg-white px-5 text-sm font-semibold text-foreground" onClick={() => handleCopy(binanceAddress, 'wallet')}>
                    {copiedValue === 'wallet' ? <Check className="ml-2 h-4 w-4" /> : <Copy className="ml-2 h-4 w-4" />}
                    {copiedValue === 'wallet' ? copy.copied : copy.copyWallet}
                  </Button>
                </div>
              ) : null}

              {order.payment_receipt_url ? (
                <div className="rounded-[28px] border border-border bg-white/70 p-5">
                  <p className="mb-3 text-sm font-medium text-foreground">{copy.uploadedProof}</p>
                  <div className="relative h-72 overflow-hidden rounded-2xl border bg-white">
                    <Image src={order.payment_receipt_url} alt={copy.uploadedProof} fill className="object-contain" />
                  </div>
                </div>
              ) : null}

              {(order.payment_status === 'paid' || order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') ? (
                <div className="rounded-[28px] border border-primary/15 bg-white/90 p-5">
                  <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">{copy.followUp}</p>
                  <h2 className="mt-2 text-2xl font-bold text-foreground">{statusHeadline}</h2>
                  <p className="mt-3 text-sm leading-8 text-muted-foreground">{copy.followUpBody}</p>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {statusCardItems.map((item) => (
                      <div key={item.label} className="rounded-[22px] border border-border bg-background px-4 py-4">
                        <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">{item.label}</p>
                        <p className="mt-2 text-base font-bold leading-7 text-foreground">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Button asChild className="min-h-[48px] rounded-full px-5">
                      <a href="/contact">{copy.contactSeller}</a>
                    </Button>
                    <Button asChild variant="outline" className="min-h-[48px] rounded-full px-5">
                      <a href="/products">{copy.continueShopping}</a>
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8">
            <Button asChild className="rounded-full px-6">
              <a href="/products">{copy.continueShopping}</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
