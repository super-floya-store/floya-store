'use client'

import { ShoppingCart, Plus, Minus, X } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

export function CartDrawer() {
  const { items, removeItem, updateQuantity, subtotal, clearCart, hasHydrated } = useCartStore()
  const { cartDrawerOpen, closeCartDrawer } = useUIStore()
  const total = subtotal()

  if (!hasHydrated) return null
  if (!cartDrawerOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-secondary/35 backdrop-blur-md" onClick={closeCartDrawer} />
      <div className="fixed left-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-hidden border-r border-white/40 bg-background/90 shadow-heavy backdrop-blur-2xl rtl:right-0 rtl:left-auto">
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-primary">YOUR BAG</p>
            <h2 className="mt-1 text-xl font-bold text-secondary">سلة التسوق</h2>
          </div>
          <button onClick={closeCartDrawer} className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-secondary text-secondary-foreground transition hover:bg-primary" aria-label="إغلاق">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="premium-scrollbar flex-1 overflow-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShoppingCart className="h-10 w-10" />
              </div>
              <p className="text-lg font-bold text-secondary">سلة التسوق فارغة</p>
              <p className="max-w-xs text-sm leading-7 text-muted-foreground">أضيفي بعض المنتجات المميزة لتبدئي تجربة شراء أنيقة وسريعة.</p>
              <Button onClick={closeCartDrawer} className="rounded-full px-6" asChild>
                <Link href="/products">تسوق الآن</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.productId} className="surface-card flex gap-3 rounded-[26px] p-3">
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
                    <p className="mt-1 text-sm font-bold text-primary">{item.price.toLocaleString()} د.ج</p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full bg-secondary/5 transition hover:bg-secondary hover:text-secondary-foreground"
                        aria-label="تقليل"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full bg-secondary/5 transition hover:bg-secondary hover:text-secondary-foreground"
                        aria-label="زيادة"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="ml-auto inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full text-destructive transition hover:bg-destructive/10"
                        aria-label="حذف"
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
                <span>المجموع الفرعي</span>
                <span className="font-bold">{total.toLocaleString()} د.ج</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>رسوم التوصيل</span>
                <span className="font-bold">500 د.ج</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>الإجمالي</span>
                <span>{(total + 500).toLocaleString()} د.ج</span>
              </div>
              <Button className="min-h-[48px] w-full rounded-full bg-gradient-to-r from-primary to-brand-gold text-primary-foreground shadow-glow" asChild onClick={closeCartDrawer}>
                <Link href="/checkout">إتمام الطلب</Link>
              </Button>
              <Button variant="outline" className="min-h-[48px] w-full rounded-full" onClick={clearCart}>
                إفراغ السلة
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
