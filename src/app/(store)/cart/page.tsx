'use client'

import { useCartStore } from '@/stores/cart-store'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Minus, Plus, X } from 'lucide-react'

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart, hasHydrated } = useCartStore()
  const locale = useUIStore((state) => state.locale)
  const total = subtotal()
  const copy = locale === 'ar'
    ? {
        kicker: 'سلة التسوق',
        title: 'سلة التسوق',
        body: 'ملخص أنيق للمنتجات المختارة مع خطوات واضحة قبل إتمام الطلب.',
        loading: 'جاري تحميل السلة...',
        empty: 'سلة التسوق فارغة',
        emptyBody: 'اختر بعض المنتجات أولاً لتشاهد ملخصاً مباشراً قبل الدفع.',
        shopNow: 'تسوق الآن',
        summary: 'ملخص الطلب',
        subtotal: 'المجموع الفرعي',
        delivery: 'التوصيل',
        total: 'الإجمالي',
        checkout: 'إتمام الطلب',
        clear: 'إفراغ السلة',
        currency: 'د.ج',
      }
    : {
        kicker: 'Shopping bag',
        title: 'Shopping cart',
        body: 'A clean summary of your selected products before checkout.',
        loading: 'Loading your cart...',
        empty: 'Your cart is empty',
        emptyBody: 'Add a few products first to see your full order summary here.',
        shopNow: 'Shop now',
        summary: 'Order summary',
        subtotal: 'Subtotal',
        delivery: 'Delivery',
        total: 'Total',
        checkout: 'Checkout',
        clear: 'Clear cart',
        currency: 'DZD',
      }

  if (!hasHydrated) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8 md:px-6">
        <h1 className="section-title mb-8">{copy.title}</h1>
        <p className="text-muted-foreground">{copy.loading}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:px-6">
      <div className="mb-8 surface-card rounded-[32px] px-6 py-8">
        <span className="section-kicker w-fit">{copy.kicker}</span>
        <h1 className="section-title mt-4">{copy.title}</h1>
        <p className="mt-4 text-sm leading-8 text-muted-foreground md:text-base">{copy.body}</p>
      </div>

      {items.length === 0 ? (
        <div className="surface-card flex flex-col items-center gap-4 rounded-[32px] py-14 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingCart className="h-10 w-10" />
          </div>
          <p className="text-xl font-bold text-secondary">{copy.empty}</p>
          <p className="max-w-md text-sm leading-7 text-muted-foreground">{copy.emptyBody}</p>
          <Button className="rounded-full px-6" asChild>
            <Link href="/products">{copy.shopNow}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col gap-4 md:col-span-2">
            {items.map((item) => (
              <div key={item.productId} className="surface-card flex gap-4 rounded-[30px] p-4">
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-[24px] bg-muted">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-secondary">{item.name}</h3>
                  <p className="mt-1 text-lg font-bold text-primary">{item.price.toLocaleString()} {copy.currency}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full bg-secondary/5 transition hover:bg-secondary hover:text-secondary-foreground">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full bg-secondary/5 transition hover:bg-secondary hover:text-secondary-foreground">
                      <Plus className="h-4 w-4" />
                    </button>
                    <button onClick={() => removeItem(item.productId)} className="mr-auto inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full text-destructive transition hover:bg-destructive/10">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Card className="surface-card sticky top-28 overflow-hidden rounded-[32px] border-white/70 shadow-medium">
            <CardHeader>
              <CardTitle className="text-xl">{copy.summary}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex justify-between text-sm">
                <span>{copy.subtotal}</span>
                <span className="font-bold">{total.toLocaleString()} {copy.currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{copy.delivery}</span>
                <span className="font-bold">500 {copy.currency}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>{copy.total}</span>
                <span>{(total + 500).toLocaleString()} {copy.currency}</span>
              </div>
              <Button className="min-h-[48px] w-full rounded-full bg-gradient-to-r from-primary to-brand-gold text-primary-foreground shadow-glow" asChild>
                <Link href="/checkout">{copy.checkout}</Link>
              </Button>
              <Button variant="outline" className="min-h-[48px] w-full rounded-full" onClick={clearCart}>
                {copy.clear}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
