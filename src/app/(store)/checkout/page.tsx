'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { useCartStore } from '@/stores/cart-store'
import { useUIStore } from '@/stores/ui-store'
import { getDeliveryFee, wilayas } from '@/lib/algeria'
import { getVipDeliveryFee } from '@/lib/pricing/vip'
import type { PaymentMethod } from '@/types/order'
import { Badge } from '@/components/ui/badge'
import { getCartFulfillment } from '@/types/cart'
import { formatPrice } from '@/lib/utils/format'

const defaultPaymentMethods = { baridimob: true, cod: true, binance: false }

export default function CheckoutPage() {
  const { items, subtotal, clearCart, hasHydrated } = useCartStore()
  const { user, loading: authLoading } = useAuth()
  const locale = useUIStore((state) => state.locale)
  const router = useRouter()
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [copiedValue, setCopiedValue] = useState<'baridi' | 'binance' | null>(null)
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    wilaya: '',
    commune: '',
    deliveryAddress: '',
    notes: '',
    paymentMethod: 'cod' as PaymentMethod,
  })
  const fulfillment = getCartFulfillment(items)
  const isMixedCart = fulfillment.isMixed
  const isDigitalOnly = fulfillment.isDigitalOnly

  const paymentMethods = settings?.payment_methods || defaultPaymentMethods
  const standardDeliveryFee = useMemo(() => getDeliveryFee(settings?.delivery_fees, formData.wilaya, 500), [settings, formData.wilaya])
  const deliveryFee = useMemo(() => getVipDeliveryFee(standardDeliveryFee, !!user?.is_vip), [standardDeliveryFee, user?.is_vip])
  const vipDiscount = useMemo(() => (!!user?.is_vip ? standardDeliveryFee - deliveryFee : 0), [deliveryFee, standardDeliveryFee, user?.is_vip])
  const total = subtotal() + deliveryFee
  const ripValue = settings?.baridimob_rip || '00799999004419717033'
  const binanceAddress = settings?.binance_wallet_address || ''

  const copy = locale === 'ar'
    ? {
        title: 'إتمام الطلب',
        loadingOrder: 'جارٍ تحميل بيانات الطلب...',
        empty: 'سلة التسوق فارغة',
        shopNow: 'تسوق الآن',
        steps: ['السلة', 'البيانات', 'التأكيد'],
        name: 'الاسم الكامل *',
        phone: 'رقم الهاتف *',
        email: 'البريد الإلكتروني',
        wilaya: 'الولاية *',
        chooseWilaya: 'اختر الولاية',
        commune: 'البلدية *',
        address: 'عنوان التوصيل *',
        notes: 'ملاحظات',
        authRequired: 'يجب تسجيل الدخول أو إنشاء حساب قبل إتمام الطلب.',
        vipPerks: 'مزايا VIP مطبقة على هذا الطلب: خصم خاص وأولوية تجهيز وتوصيل مجاني.',
        paymentMethods: 'طريقة الدفع',
        paymentOptions: {
          cod: { label: 'الدفع عند الاستلام', body: 'ادفع للمندوب عند استلام الطلب. لا تحتاج إلى رفع إثبات دفع.' },
          baridimob: { label: 'BaridiMob', body: 'حوّل المبلغ إلى RIP التالي ثم ارفع الوصل بعد إنشاء الطلب.' },
          binance: { label: 'Binance / USDT', body: 'أرسل المبلغ إلى عنوان المحفظة التالي ثم ارفع لقطة التحويل بعد إنشاء الطلب.' },
        },
        copyRip: 'نسخ RIP',
        copyWallet: 'نسخ العنوان',
        copied: 'تم النسخ',
        submit: 'تأكيد الطلب',
        submitting: 'جارٍ إرسال الطلب...',
        summary: 'ملخص الطلب',
        subtotal: 'المجموع الفرعي',
        delivery: 'التوصيل',
        serviceFee: 'رسوم المعالجة',
        total: 'الإجمالي',
        instructions: 'تعليمات الدفع',
        instructionsBody: 'بعد إنشاء الطلب سيتم توجيهك إلى صفحة متابعة الطلب. إذا اخترت BaridiMob أو Binance يمكنك هناك رفع صورة الإثبات وإدخال رقم العملية أو التحويل. أما الدفع عند الاستلام فلا يحتاج أي إثبات.',
        orderFailed: 'فشل إنشاء الطلب',
        retry: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
        mixedTitle: 'السلة المختلطة غير مدعومة حالياً',
        mixedBody: 'يجب فصل المنتجات الرقمية عن المنتجات المادية في طلبين مختلفين حتى يطابق مسار الإتمام طريقة التسليم.',
        digitalTitle: 'طلب رقمي فقط',
        digitalBody: 'لن تحتاج إلى شحن فعلي لهذا الطلب. استخدم الحقول أدناه لإدخال بيانات التواصل أو الحساب المطلوبة لتسليم المنتج الرقمي.',
        region: 'المنطقة / الولاية *',
        city: 'المدينة / المنطقة الفرعية *',
        deliveryDetails: 'بيانات التسليم الرقمي *',
        deliveryDetailsHint: 'مثال: البريد الإلكتروني المستلم أو اسم الحساب أو المعرّف المطلوب للتسليم.',
        contactDetails: 'يتم استخدام هذه البيانات لتسليم المنتج الرقمي أو التواصل معك بشأنه.',
        type: 'النوع',
        variant: 'النسخة',
        digital: 'رقمي',
        physical: 'مادي',
      }
    : {
        title: 'Checkout',
        loadingOrder: 'Loading order details...',
        empty: 'Your cart is empty',
        shopNow: 'Shop now',
        steps: ['Cart', 'Details', 'Confirmation'],
        name: 'Full name *',
        phone: 'Phone number *',
        email: 'Email',
        wilaya: 'Wilaya *',
        chooseWilaya: 'Choose a wilaya',
        commune: 'Commune *',
        address: 'Delivery address *',
        notes: 'Notes',
        authRequired: 'You need to sign in or create an account before completing a purchase.',
        vipPerks: 'VIP perks are active on this order: special pricing, priority handling, and free delivery.',
        paymentMethods: 'Payment method',
        paymentOptions: {
          cod: { label: 'Cash on delivery', body: 'Pay the courier when your order arrives. No payment proof is needed.' },
          baridimob: { label: 'BaridiMob', body: 'Transfer the total to the RIP below, then upload the receipt after the order is created.' },
          binance: { label: 'Binance / USDT', body: 'Send the amount to the wallet address below, then upload a transfer screenshot after the order is created.' },
        },
        copyRip: 'Copy RIP',
        copyWallet: 'Copy address',
        copied: 'Copied',
        submit: 'Confirm order',
        submitting: 'Submitting order...',
        summary: 'Order summary',
        subtotal: 'Subtotal',
        delivery: 'Delivery',
        serviceFee: 'Handling',
        total: 'Total',
        instructions: 'Payment instructions',
        instructionsBody: 'After the order is created you will be sent to the order tracking page. If you choose BaridiMob or Binance, you can upload payment proof and enter the transaction reference there. Cash on delivery does not require proof.',
        orderFailed: 'Failed to create order',
        retry: 'Something went wrong. Please try again.',
        mixedTitle: 'Mixed carts are not supported yet',
        mixedBody: 'Split digital and physical items into separate orders so the checkout flow can match the fulfillment method.',
        digitalTitle: 'Digital-only order',
        digitalBody: 'No physical shipping is needed for this order. Use the fields below for the contact or account details required to deliver the digital product.',
        region: 'Region / wilaya *',
        city: 'City / area *',
        deliveryDetails: 'Digital delivery details *',
        deliveryDetailsHint: 'Example: recipient email, account name, or the ID needed for delivery.',
        contactDetails: 'These details are used to deliver the digital item or contact you about it.',
        type: 'Type',
        variant: 'Variant',
        digital: 'Digital',
        physical: 'Physical',
      }

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?next=/checkout')
    }
  }, [authLoading, router, user])

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSettings(data.data)
          const methods = data.data?.payment_methods || defaultPaymentMethods
          const firstEnabled = (['cod', 'baridimob', 'binance'] as PaymentMethod[]).find((method) => methods[method]) || 'cod'
          setFormData((current) => ({ ...current, paymentMethod: firstEnabled }))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (user) {
      setFormData((current) => ({
        ...current,
        customerName: current.customerName || user.full_name || '',
        customerEmail: current.customerEmail || user.email || '',
      }))
    }
  }, [user])

  const handleCopy = async (value: string, type: 'baridi' | 'binance') => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedValue(type)
      window.setTimeout(() => setCopiedValue(null), 1800)
    } catch {
      // ignore
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isMixedCart) return
    setLoading(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          customerEmail: formData.customerEmail.trim() || null,
          notes: formData.notes.trim() || null,
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity, variantId: item.variantId || null })),
        }),
      })

      const data = await res.json()

      if (data.success) {
        clearCart()
        router.push(`/order/${data.data.orderNumber}`)
      } else {
        alert(data.error?.message || copy.orderFailed)
      }
    } catch {
      alert(copy.retry)
    } finally {
      setLoading(false)
    }
  }

  if (!hasHydrated || authLoading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8 md:px-6">
        <h1 className="section-title mb-8">{copy.title}</h1>
        <p className="text-muted-foreground">{copy.loadingOrder}</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-10 md:px-6">
        <Card className="surface-card rounded-[32px]">
          <CardContent className="space-y-5 p-8 text-center">
            <h1 className="text-2xl font-bold">{copy.title}</h1>
            <p className="text-sm leading-7 text-muted-foreground">{copy.authRequired}</p>
            <Button asChild className="rounded-full">
              <a href="/login?next=/checkout">Login / Sign up</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="mb-4 text-2xl font-bold">{copy.empty}</h1>
        <Button className="rounded-full px-6" asChild>
          <a href="/products">{copy.shopNow}</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:px-6">
      <div className="mb-8 surface-card rounded-[32px] px-6 py-8">
        <span className="section-kicker w-fit">CHECKOUT FLOW</span>
        <h1 className="section-title mt-4">{copy.title}</h1>
        <div className="mt-6 grid grid-cols-3 gap-3 md:max-w-xl">
          {copy.steps.map((step, index) => (
            <div key={step} className={`rounded-full px-4 py-3 text-center text-sm font-semibold ${index < 2 ? 'bg-secondary text-secondary-foreground shadow-soft' : 'bg-primary/10 text-primary'}`}>
              {step}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="surface-card flex flex-col gap-4 rounded-[32px] p-5 md:p-6">
          {isMixedCart ? (
            <div className="rounded-[24px] border border-destructive/25 bg-destructive/5 px-4 py-4 text-sm leading-7 text-foreground">
              <p className="font-bold text-destructive">{copy.mixedTitle}</p>
              <p className="mt-2 text-muted-foreground">{copy.mixedBody}</p>
            </div>
          ) : null}

          {isDigitalOnly ? (
            <div className="rounded-[24px] border border-primary/20 bg-primary/5 px-4 py-4 text-sm leading-7 text-foreground">
              <p className="font-bold text-primary">{copy.digitalTitle}</p>
              <p className="mt-2 text-muted-foreground">{copy.digitalBody}</p>
              <p className="mt-2 text-xs text-muted-foreground">{copy.contactDetails}</p>
            </div>
          ) : null}

          {user.is_vip ? (
            <div className="rounded-[24px] border border-brand-gold/40 bg-brand-gold/10 px-4 py-4 text-sm leading-7 text-foreground">
              {copy.vipPerks}
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">{copy.name}</Label>
            <Input id="name" required value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} className="min-h-[48px] rounded-2xl border-white/80 bg-white/80" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">{copy.phone}</Label>
            <Input id="phone" required placeholder="0XXXXXXXXX" pattern="^0[5-7][0-9]{8}$" value={formData.customerPhone} onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })} className="min-h-[48px] rounded-2xl border-white/80 bg-white/80" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{copy.email}</Label>
            <Input id="email" type="email" value={formData.customerEmail} onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })} className="min-h-[48px] rounded-2xl border-white/80 bg-white/80" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="wilaya">{isDigitalOnly ? copy.region : copy.wilaya}</Label>
            <select id="wilaya" required className="flex min-h-[48px] w-full rounded-2xl border border-white/80 bg-white/80 px-3 py-2 text-sm" value={formData.wilaya} onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}>
              <option value="">{copy.chooseWilaya}</option>
              {wilayas.map((w) => (
                <option key={w.ar} value={w.ar}>{locale === 'ar' ? w.ar : w.fr}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="commune">{isDigitalOnly ? copy.city : copy.commune}</Label>
            <Input id="commune" required value={formData.commune} onChange={(e) => setFormData({ ...formData, commune: e.target.value })} className="min-h-[48px] rounded-2xl border-white/80 bg-white/80" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="address">{isDigitalOnly ? copy.deliveryDetails : copy.address}</Label>
            <textarea id="address" required rows={3} className="flex w-full rounded-[20px] border border-white/80 bg-white/80 px-3 py-3 text-sm" value={formData.deliveryAddress} onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })} />
            {isDigitalOnly ? <p className="text-xs text-muted-foreground">{copy.deliveryDetailsHint}</p> : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">{copy.notes}</Label>
            <textarea id="notes" rows={2} className="flex w-full rounded-[20px] border border-white/80 bg-white/80 px-3 py-3 text-sm" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          </div>

          <div className="rounded-[24px] border border-primary/20 bg-primary/5 p-4 text-sm leading-8 text-foreground">
            <p className="font-bold text-foreground">{copy.paymentMethods}</p>
            <div className="mt-4 grid gap-3">
              {(['cod', 'baridimob', 'binance'] as PaymentMethod[]).filter((method) => paymentMethods[method]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: method })}
                  className={`rounded-[22px] border px-4 py-4 text-right transition ${
                    formData.paymentMethod === method ? 'border-primary bg-white shadow-soft' : 'border-border bg-white/70'
                  }`}
                >
                  <p className="font-bold text-foreground">{copy.paymentOptions[method].label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{copy.paymentOptions[method].body}</p>
                </button>
              ))}
            </div>

            {formData.paymentMethod === 'baridimob' ? (
              <div className="mt-3 flex flex-col gap-3 rounded-[22px] border border-border bg-white px-4 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">RIP</p>
                  <p className="mt-2 whitespace-nowrap overflow-x-auto text-lg font-extrabold tracking-[0.14em] text-black sm:text-xl md:text-2xl">{ripValue}</p>
                </div>
                <Button type="button" variant="outline" className="min-h-[48px] rounded-full border-border bg-white px-5 text-sm font-semibold text-foreground" onClick={() => handleCopy(ripValue, 'baridi')}>
                  {copiedValue === 'baridi' ? <Check className="ml-2 h-4 w-4" /> : <Copy className="ml-2 h-4 w-4" />}
                  {copiedValue === 'baridi' ? copy.copied : copy.copyRip}
                </Button>
              </div>
            ) : null}

            {formData.paymentMethod === 'binance' && binanceAddress ? (
              <div className="mt-3 flex flex-col gap-3 rounded-[22px] border border-border bg-white px-4 py-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">USDT Wallet</p>
                  <p className="mt-2 overflow-x-auto text-sm font-bold text-black md:text-base">{binanceAddress}</p>
                </div>
                <Button type="button" variant="outline" className="min-h-[48px] rounded-full border-border bg-white px-5 text-sm font-semibold text-foreground" onClick={() => handleCopy(binanceAddress, 'binance')}>
                  {copiedValue === 'binance' ? <Check className="ml-2 h-4 w-4" /> : <Copy className="ml-2 h-4 w-4" />}
                  {copiedValue === 'binance' ? copy.copied : copy.copyWallet}
                </Button>
              </div>
            ) : null}
          </div>

          <Button type="submit" className="min-h-[52px] w-full rounded-full bg-gradient-to-r from-primary to-brand-gold text-base font-bold text-primary-foreground shadow-glow" disabled={loading || isMixedCart}>
            {loading ? copy.submitting : copy.submit}
          </Button>
        </form>

        <div className="flex flex-col gap-4">
          <Card className="surface-card overflow-hidden rounded-[32px] border-white/70">
            <CardHeader>
              <CardTitle>{copy.summary}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.cartItemId} className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span>{item.name} × {item.quantity}</span>
                    <span><bdi>{formatPrice(item.price * item.quantity, 'DZD', locale)}</bdi></span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="rounded-full">
                      {copy.type}: {item.productType === 'digital' ? copy.digital : copy.physical}
                    </Badge>
                    {item.variantLabel ? (
                      <Badge variant="outline" className="rounded-full">
                        {copy.variant}: {item.variantLabel}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              ))}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>{copy.subtotal}</span>
                  <span><bdi>{formatPrice(subtotal(), 'DZD', locale)}</bdi></span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{isDigitalOnly ? copy.serviceFee : copy.delivery}</span>
                  <span><bdi>{formatPrice(deliveryFee, 'DZD', locale)}</bdi></span>
                </div>
                {vipDiscount > 0 ? (
                  <div className="flex justify-between text-sm text-primary">
                    <span>VIP</span>
                    <span>-<bdi>{formatPrice(vipDiscount, 'DZD', locale)}</bdi></span>
                  </div>
                ) : null}
                <div className="flex justify-between text-lg font-bold">
                  <span>{copy.total}</span>
                  <span><bdi>{formatPrice(total, 'DZD', locale)}</bdi></span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-card rounded-[32px] border-white/70">
            <CardHeader>
              <CardTitle>{copy.instructions}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-8 text-muted-foreground">
                {isDigitalOnly ? `${copy.digitalBody} ${copy.instructionsBody}` : copy.instructionsBody}
              </p>
              {formData.paymentMethod === 'baridimob' ? (
                <div className="mt-4 rounded-2xl border border-border bg-white px-4 py-4">
                  <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">RIP</p>
                  <p className="mt-2 whitespace-nowrap overflow-x-auto text-center text-lg font-extrabold tracking-[0.14em] text-black sm:text-xl md:text-2xl">{ripValue}</p>
                </div>
              ) : null}
              {formData.paymentMethod === 'binance' && binanceAddress ? (
                <div className="mt-4 rounded-2xl border border-border bg-white px-4 py-4">
                  <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">USDT Wallet</p>
                  <p className="mt-2 overflow-x-auto text-center text-sm font-bold text-black md:text-base">{binanceAddress}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
