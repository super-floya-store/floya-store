'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/stores/ui-store'

export default function AccountPage() {
  const { user, loading, logout } = useAuth()
  const locale = useUIStore((state) => state.locale)
  const router = useRouter()

  const copy = locale === 'ar'
    ? {
        title: 'الحساب',
        subtitle: 'من هنا يمكنك الوصول السريع لمتابعة الطلبات والرجوع إلى التسوق.',
        profile: 'بيانات الحساب',
        username: 'اسم المستخدم',
        role: 'نوع الحساب',
        customer: 'عميل',
        orders: 'متابعة الطلبات',
        ordersBody: 'إذا كان لديك رقم طلب، يمكنك فتح صفحة المتابعة مباشرة.',
        openOrder: 'فتح صفحة طلب',
        contact: 'تواصل معنا',
        continueShopping: 'متابعة التسوق',
        logout: 'تسجيل الخروج',
        loginRequired: 'يجب تسجيل الدخول أولاً.',
      }
    : {
        title: 'Account',
        subtitle: 'Use this page for quick access to order follow-up and shopping links.',
        profile: 'Account details',
        username: 'Username',
        role: 'Account type',
        customer: 'Customer',
        orders: 'Order follow-up',
        ordersBody: 'If you already have an order number, open its tracking page directly.',
        openOrder: 'Open order page',
        contact: 'Contact us',
        continueShopping: 'Continue shopping',
        logout: 'Log out',
        loginRequired: 'You need to sign in first.',
      }

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, router, user])

  if (loading || !user) return null

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 md:px-6">
      <div className="mb-8">
        <span className="section-kicker w-fit">{copy.title.toUpperCase()}</span>
        <h1 className="section-title mt-4">{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-muted-foreground md:text-base">{copy.subtitle}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="surface-card rounded-[28px]">
          <CardHeader>
            <CardTitle>{copy.profile}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><span className="font-semibold">{copy.username}:</span> {user.username}</p>
            <p><span className="font-semibold">{copy.role}:</span> {copy.customer}</p>
          </CardContent>
        </Card>

        <Card className="surface-card rounded-[28px]">
          <CardHeader>
            <CardTitle>{copy.orders}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="leading-7 text-muted-foreground">{copy.ordersBody}</p>
            <div className="flex flex-col gap-3">
              <Button asChild className="rounded-full">
                <Link href="/contact">{copy.contact}</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/products">{copy.continueShopping}</Link>
              </Button>
              <Button variant="ghost" className="rounded-full" onClick={logout}>
                {copy.logout}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
