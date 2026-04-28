'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUIStore } from '@/stores/ui-store'

export default function AccountPage() {
  const locale = useUIStore((state) => state.locale)
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState('')

  const copy = locale === 'ar'
    ? {
        title: 'متابعة الطلب',
        subtitle: 'لا يحتاج العملاء إلى حساب. أدخل رقم الطلب لمتابعة الحالة ورفع إثبات الدفع وفتح الإيصال عند التأكيد.',
        orderNumber: 'رقم الطلب',
        track: 'متابعة الطلب',
        contact: 'التواصل مع المتجر',
        shop: 'مواصلة التسوق',
      }
    : {
        title: 'Order follow-up',
        subtitle: 'Customers do not need an account. Enter your order number to track the status, upload payment proof, and open the receipt once it is confirmed.',
        orderNumber: 'Order number',
        track: 'Track order',
        contact: 'Contact the store',
        shop: 'Continue shopping',
      }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const value = orderNumber.trim()
    if (!value) return
    router.push(`/order/${encodeURIComponent(value)}`)
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="mb-8">
        <span className="section-kicker w-fit">{copy.title.toUpperCase()}</span>
        <h1 className="section-title mt-4">{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-muted-foreground md:text-base">{copy.subtitle}</p>
      </div>

      <Card className="surface-card rounded-[28px]">
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="order-number">{copy.orderNumber}</Label>
              <Input
                id="order-number"
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value)}
                className="min-h-[48px] rounded-2xl"
                placeholder="FS-2026-000123"
              />
            </div>
            <Button type="submit" className="rounded-full">
              {copy.track}
            </Button>
          </form>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/contact">{copy.contact}</Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-full">
              <Link href="/products">{copy.shop}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
