'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/stores/ui-store'
import type { OrderWithItems } from '@/types/order'

export default function AccountPage() {
  const { user, loading, logout, isAdmin } = useAuth()
  const locale = useUIStore((state) => state.locale)
  const router = useRouter()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  const copy = locale === 'ar'
    ? {
        title: 'الحساب',
        subtitle: 'من هنا يمكنك متابعة جميع طلباتك، تنزيل الإيصالات، والوصول إلى مزايا VIP إن كانت مفعلة.',
        profile: 'بيانات الحساب',
        email: 'البريد الإلكتروني',
        role: 'نوع الحساب',
        customer: 'عميل',
        admin: 'مدير',
        vip: 'عميل VIP',
        vipBody: 'خصم خاص على المنتجات، توصيل مجاني، وأولوية في التجهيز والمتابعة.',
        orders: 'طلباتي',
        ordersBody: 'جميع الطلبات مرتبطة بحسابك وتظهر هنا مع حالة الطلب والدفع والاسترجاع.',
        noOrders: 'لا توجد طلبات بعد.',
        contact: 'تواصل معنا',
        continueShopping: 'متابعة التسوق',
        adminPanel: 'الذهاب إلى لوحة الإدارة',
        adminBody: 'هذا الحساب يملك صلاحية الإدارة ويمكنه فتح لوحة التحكم مباشرة.',
        logout: 'تسجيل الخروج',
        supportReset: 'يمكنك إعادة تعيين كلمة المرور من صفحة نسيت كلمة المرور باستخدام بريدك الإلكتروني.',
        confirmedReceipt: 'عرض الإيصال',
        pendingReceipt: 'الإيصال يظهر بعد تأكيد الطلب',
        total: 'الإجمالي',
        order: 'الطلب',
        payment: 'الدفع',
        refund: 'الاسترجاع',
      }
    : {
        title: 'Account',
        subtitle: 'Track every order, open receipts, and review VIP perks from one place.',
        profile: 'Account details',
        email: 'Email',
        role: 'Account type',
        customer: 'Customer',
        admin: 'Admin',
        vip: 'VIP customer',
        vipBody: 'Special product pricing, free delivery, and priority handling are active on your account.',
        orders: 'My orders',
        ordersBody: 'All of your orders are linked to this account with order, payment, and refund statuses.',
        noOrders: 'No orders yet.',
        contact: 'Contact us',
        continueShopping: 'Continue shopping',
        adminPanel: 'Go to admin dashboard',
        adminBody: 'This account has admin access and can open the dashboard directly.',
        logout: 'Log out',
        supportReset: 'You can reset your password from the forgot-password page using your email address.',
        confirmedReceipt: 'Open receipt',
        pendingReceipt: 'Receipt unlocks after order confirmation',
        total: 'Total',
        order: 'Order',
        payment: 'Payment',
        refund: 'Refund',
      }

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/account')
    }
  }, [loading, router, user])

  useEffect(() => {
    if (!user) return

    fetch('/api/account/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.data)
        }
      })
      .finally(() => setOrdersLoading(false))
  }, [user])

  if (loading || !user) return null

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 md:px-6">
      <div className="mb-8">
        <span className="section-kicker w-fit">{copy.title.toUpperCase()}</span>
        <h1 className="section-title mt-4">{copy.title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-muted-foreground md:text-base">{copy.subtitle}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="surface-card rounded-[28px]">
          <CardHeader>
            <CardTitle>{copy.profile}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><span className="font-semibold">{copy.email}:</span> {user.email}</p>
            <p><span className="font-semibold">{copy.role}:</span> {isAdmin ? copy.admin : copy.customer}</p>
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 leading-7 text-amber-900">{copy.supportReset}</p>
          </CardContent>
        </Card>

        <Card className="surface-card rounded-[28px]">
          <CardHeader>
            <CardTitle>{user.is_vip ? copy.vip : copy.orders}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {user.is_vip ? (
              <div className="rounded-[24px] border border-brand-gold/40 bg-brand-gold/10 px-4 py-4 leading-7 text-foreground">
                <Badge className="mb-3 rounded-full bg-secondary text-secondary-foreground">VIP</Badge>
                <p>{copy.vipBody}</p>
              </div>
            ) : (
              <p className="leading-7 text-muted-foreground">{copy.ordersBody}</p>
            )}
            <div className="flex flex-col gap-3">
              {isAdmin ? (
                <>
                  <p className="leading-7 text-muted-foreground">{copy.adminBody}</p>
                  <Button asChild className="rounded-full">
                    <Link href="/admin">{copy.adminPanel}</Link>
                  </Button>
                </>
              ) : null}
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

      <div className="mt-8">
        <Card className="surface-card rounded-[28px]">
          <CardHeader>
            <CardTitle>{copy.orders}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-muted-foreground">{copy.ordersBody}</p>
            {ordersLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">{copy.noOrders}</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const canOpenReceipt = ['confirmed', 'processing', 'shipped', 'delivered', 'refunded'].includes(order.status)
                  return (
                    <div key={order.id} className="rounded-[24px] border bg-background/70 p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <p className="font-bold">{copy.order}: {order.order_number}</p>
                          <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US')}</p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="secondary">{copy.order}: {order.status}</Badge>
                            <Badge variant="outline">{copy.payment}: {order.payment_status}</Badge>
                            <Badge variant="outline">{copy.refund}: {order.refund_status}</Badge>
                            {order.priority_fulfillment ? <Badge className="bg-secondary text-secondary-foreground">VIP</Badge> : null}
                          </div>
                        </div>
                        <div className="flex flex-col items-start gap-3 md:items-end">
                          <p className="text-lg font-bold">{copy.total}: {Number(order.total).toLocaleString()} {locale === 'ar' ? 'د.ج' : 'DZD'}</p>
                          {canOpenReceipt ? (
                            <Button asChild className="rounded-full">
                              <Link href={`/account/receipts/${order.order_number}`}>{copy.confirmedReceipt}</Link>
                            </Button>
                          ) : (
                            <p className="text-xs text-muted-foreground">{copy.pendingReceipt}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
