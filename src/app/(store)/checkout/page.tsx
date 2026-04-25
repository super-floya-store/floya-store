'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCartStore } from '@/stores/cart-store'
import { useRouter } from 'next/navigation'
import { getDeliveryFee, wilayas } from '@/lib/algeria'
import { Copy, Check } from 'lucide-react'

export default function CheckoutPage() {
  const { items, subtotal, clearCart, hasHydrated } = useCartStore()
  const router = useRouter()
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [copiedRip, setCopiedRip] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    wilaya: '',
    commune: '',
    deliveryAddress: '',
    notes: '',
    paymentMethod: 'baridimob' as 'baridimob',
  })
  const deliveryFee = useMemo(() => getDeliveryFee(settings?.delivery_fees, formData.wilaya, 500), [settings, formData.wilaya])
  const total = subtotal() + deliveryFee
  const ripValue = settings?.baridimob_rip || '00799999004419717033'

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSettings(data.data)
      })
      .catch(() => {})
  }, [])

  const handleCopyRip = async () => {
    try {
      await navigator.clipboard.writeText(ripValue)
      setCopiedRip(true)
      window.setTimeout(() => setCopiedRip(false), 1800)
    } catch {
      // ignore
    }
  }

  if (!hasHydrated) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8 md:px-6">
        <h1 className="section-title mb-8">إتمام الطلب</h1>
        <p className="text-muted-foreground">جاري تحميل بيانات الطلب...</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          customerEmail: formData.customerEmail.trim() || null,
          notes: formData.notes.trim() || null,
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      })

      const data = await res.json()

      if (data.success) {
        clearCart()
        router.push(`/order/${data.data.orderNumber}`)
      } else {
        alert(data.error?.message || 'فشل إنشاء الطلب')
      }
    } catch {
      alert('حدث خطأ. يرجى المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">سلة التسوق فارغة</h1>
        <Button className="rounded-full px-6" asChild>
          <a href="/products">تسوق الآن</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:px-6">
      <div className="mb-8 surface-card rounded-[32px] px-6 py-8">
        <span className="section-kicker w-fit">CHECKOUT FLOW</span>
        <h1 className="section-title mt-4">إتمام الطلب</h1>
        <div className="mt-6 grid grid-cols-3 gap-3 md:max-w-xl">
          {['السلة', 'البيانات', 'التأكيد'].map((step, index) => (
            <div key={step} className={`rounded-full px-4 py-3 text-center text-sm font-semibold ${index < 2 ? 'bg-secondary text-secondary-foreground shadow-soft' : 'bg-primary/10 text-primary'}`}>
              {step}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="surface-card flex flex-col gap-4 rounded-[32px] p-5 md:p-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">الاسم الكامل *</Label>
            <Input
              id="name"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="min-h-[48px] rounded-2xl border-white/80 bg-white/80"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">رقم الهاتف *</Label>
            <Input
              id="phone"
              required
              placeholder="0XXXXXXXXX"
              pattern="^0[5-7][0-9]{8}$"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              className="min-h-[48px] rounded-2xl border-white/80 bg-white/80"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              className="min-h-[48px] rounded-2xl border-white/80 bg-white/80"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="wilaya">الولاية *</Label>
            <select
              id="wilaya"
              required
              className="flex min-h-[48px] w-full rounded-2xl border border-white/80 bg-white/80 px-3 py-2 text-sm"
              value={formData.wilaya}
              onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
            >
              <option value="">اختر الولاية</option>
              {wilayas.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="commune">البلدية / البلدية *</Label>
            <Input
              id="commune"
              required
              value={formData.commune}
              onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
              className="min-h-[48px] rounded-2xl border-white/80 bg-white/80"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="address">عنوان التوصيل *</Label>
            <textarea
              id="address"
              required
              rows={3}
              className="flex w-full rounded-[20px] border border-white/80 bg-white/80 px-3 py-3 text-sm"
              value={formData.deliveryAddress}
              onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <textarea
              id="notes"
              rows={2}
              className="flex w-full rounded-[20px] border border-white/80 bg-white/80 px-3 py-3 text-sm"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="rounded-[24px] border border-primary/20 bg-primary/5 p-4 text-sm leading-8 text-foreground">
            <p className="font-bold text-foreground">الدفع عبر BaridiMob</p>
            <p>حوّلي المبلغ إلى RIP التالي ثم ارفعي وصل الدفع بعد إنشاء الطلب:</p>
            <div className="mt-3 flex flex-col gap-3 rounded-[22px] border border-border bg-white px-4 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">RIP</p>
                <p className="mt-2 whitespace-nowrap overflow-x-auto text-lg font-extrabold tracking-[0.14em] text-black sm:text-xl md:text-2xl">{ripValue}</p>
              </div>
              <Button type="button" variant="outline" className="min-h-[48px] rounded-full border-border bg-white px-5 text-sm font-semibold text-foreground" onClick={handleCopyRip}>
                {copiedRip ? <Check className="ml-2 h-4 w-4" /> : <Copy className="ml-2 h-4 w-4" />}
                {copiedRip ? 'تم النسخ' : 'نسخ RIP'}
              </Button>
            </div>
          </div>

          <Button type="submit" className="min-h-[52px] w-full rounded-full bg-gradient-to-r from-primary to-brand-gold text-base font-bold text-primary-foreground shadow-glow" disabled={loading}>
            {loading ? 'جاري إرسال الطلب...' : 'تأكيد الطلب'}
          </Button>
        </form>

        <div className="flex flex-col gap-4">
          <Card className="surface-card overflow-hidden rounded-[32px] border-white/70">
            <CardHeader>
              <CardTitle>ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{(item.price * item.quantity).toLocaleString()} د.ج</span>
                </div>
              ))}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>المجموع الفرعي</span>
                  <span>{subtotal().toLocaleString()} د.ج</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>التوصيل</span>
                  <span>{deliveryFee.toLocaleString()} د.ج</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>الإجمالي</span>
                  <span>{total.toLocaleString()} د.ج</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="surface-card rounded-[32px] border-white/70">
            <CardHeader>
              <CardTitle>تعليمات الدفع عبر BaridiMob</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-8 text-muted-foreground">
                بعد إنشاء الطلب، سيتم توجيهك لصفحة تتبع الطلب حيث يمكنك رفع صورة الوصل وإدخال رقم العملية. بعدها تقوم الإدارة بمراجعة الدفع وتأكيد الطلب.
              </p>
              <div className="mt-4 rounded-2xl border border-border bg-white px-4 py-4">
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">RIP</p>
                <p className="mt-2 whitespace-nowrap overflow-x-auto text-center text-lg font-extrabold tracking-[0.14em] text-black sm:text-xl md:text-2xl">{ripValue}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
