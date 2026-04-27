'use client'

import { ShoppingCart, Plus, Minus, X } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import Link from 'next/link'
import { getCartFulfillment } from '@/types/cart'

export function CartDrawer() {
  const { items, removeItem, updateQuantity, subtotal, clearCart, hasHydrated } = useCartStore()
  const { cartDrawerOpen, closeCartDrawer, locale } = useUIStore()
  const total = subtotal()
  const fulfillment = getCartFulfillment(items)
  const fee = fulfillment.isDigitalOnly ? 0 : 500
  const copy = locale === 'ar'
    ? {
        title: 'سلة التسوق',
        empty: 'سلة التسوق فارغة',
        emptyBody: 'أضف بعض المنتجات المميزة لتبدأ تجربة شراء أنيقة وسريعة.',
        shopNow: 'تسوق الآن',
        subtotal: 'المجموع الفرعي',
        delivery: 'رسوم التوصيل',
        total: 'الإجمالي',
        checkout: 'إتمام الطلب',
        clear: 'إفراغ السلة',
        close: 'إغلاق',
        decrease: 'تقليل',
        increase: 'زيادة',
        remove: 'حذف',
        bag: 'YOUR BAG',
        variant: 'النسخة',
        digital: 'رقمي',
        physical: 'مادي',
        service: 'رسوم المعالجة',
        mixed: 'افصل المنتجات الرقمية عن المادية قبل إتمام الطلب.',
        currency: 'د.ج',
      }
    : {
        title: 'Shopping cart',
        empty: 'Your cart is empty',
        emptyBody: 'Add a few products to start a faster and cleaner checkout flow.',
        shopNow: 'Shop now',
        subtotal: 'Subtotal',
        delivery: 'Delivery',
        total: 'Total',
        checkout: 'Checkout',
        clear: 'Clear cart',
        close: 'Close',
        decrease: 'Decrease quantity',
        increase: 'Increase quantity',
        remove: 'Remove item',
        bag: 'YOUR BAG',
        variant: 'Variant',
        digital: 'Digital',
        physical: 'Physical',
        service: 'Handling',
        mixed: 'Separate digital and physical items before checkout.',
        currency: 'DZD',
      }

  if (!hasHydrated) return null
  if (!cartDrawerOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-secondary/35 backdrop-blur-md" onClick={closeCartDrawer} />
      <div className={`fixed top-0 z-50 flex h-full w-full max-w-md flex-col overflow-hidden bg-background/90 shadow-heavy backdrop-blur-2xl ${
        locale === 'ar' ? 'right-0 border-l border-white/40' : 'left-0 border-r border-white/40'
      }`}>
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-primary">{copy.bag}</p>
            <h2 className="mt-1 text-xl font-bold text-secondary">{copy.title}</h2>
          </div>
          <button onClick={closeCartDrawer} className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-secondary text-secondary-foreground transition hover:bg-primary" aria-label={copy.close}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="premium-scrollbar flex-1 overflow-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShoppingCart className="h-10 w-10" />
              </div>
              <p className="text-lg font-bold text-secondary">{copy.empty}</p>
              <p className="max-w-xs text-sm leading-7 text-muted-foreground">{copy.emptyBody}</p>
              <Button onClick={closeCartDrawer} className="rounded-full px-6" asChild>
                <Link href="/products">{copy.shopNow}</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {fulfillment.isMixed ? (
                <div className="rounded-[22px] border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-muted-foreground">
                  {copy.mixed}
                </div>
              ) : null}
              {items.map((item) => (
                <div key={item.cartItemId} className="surface-card flex gap-3 rounded-[26px] p-3">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-[20px] bg-muted">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate text-sm font-bold text-secondary">{item.name}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="rounded-full">
                        {item.productType === 'digital' ? copy.digital : copy.physical}
                      </Badge>
                      {item.variantLabel ? (
                        <Badge variant="outline" className="rounded-full">
                          {copy.variant}: {item.variantLabel}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm font-bold text-primary">{item.price.toLocaleString()} {copy.currency}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full bg-secondary/5 transition hover:bg-secondary hover:text-secondary-foreground"
                        aria-label={copy.decrease}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full bg-secondary/5 transition hover:bg-secondary hover:text-secondary-foreground"
                        aria-label={copy.increase}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.cartItemId)}
                        className="ml-auto inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full text-destructive transition hover:bg-destructive/10"
                        aria-label={copy.remove}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border/70 bg-white/55 p-4">
            <div className="surface-card flex flex-col gap-4 rounded-[28px] p-4">
              <div className="flex justify-between text-sm">
                <span>{copy.subtotal}</span>
                <span className="font-bold">{total.toLocaleString()} {copy.currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{fulfillment.isDigitalOnly ? copy.service : copy.delivery}</span>
                <span className="font-bold">{fee.toLocaleString()} {copy.currency}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>{copy.total}</span>
                <span>{(total + fee).toLocaleString()} {copy.currency}</span>
              </div>
              {fulfillment.isMixed ? (
                <Button className="min-h-[48px] w-full rounded-full bg-gradient-to-r from-primary to-brand-gold text-primary-foreground shadow-glow" disabled>
                  {copy.checkout}
                </Button>
              ) : (
                <Button className="min-h-[48px] w-full rounded-full bg-gradient-to-r from-primary to-brand-gold text-primary-foreground shadow-glow" asChild onClick={closeCartDrawer}>
                  <Link href="/checkout">{copy.checkout}</Link>
                </Button>
              )}
              <Button variant="outline" className="min-h-[48px] w-full rounded-full" onClick={clearCart}>
                {copy.clear}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
