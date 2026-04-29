'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Box, DollarSign, Receipt, Sparkles, TrendingUp } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { AdminEmptyState, AdminPageHeader, AdminPanel, AdminStatCard } from '@/components/admin/AdminShell'
import { useUIStore } from '@/stores/ui-store'
import { formatNumber, formatPrice } from '@/lib/utils/format'

interface DashboardStats {
  revenue: { total: number; thisPeriod: number }
  orders: { total: number; thisPeriod: number }
  products: { published: number; outOfStock: number; lowStock: number }
  moderation: { commentsPending: number; contactNew: number; paymentsSubmitted: number }
  customerFlags: { vip: number; blacklisted: number }
  recentOrders: Array<{
    id: string
    order_number: string
    customer_name: string
    total: number
    status: string
    payment_status: string
    created_at: string
  }>
  lowStockProducts: Array<{
    id: string
    name_ar: string
    name_en: string
    slug: string
    stock_quantity: number
    low_stock_threshold: number
    is_published: boolean
  }>
  topProducts: Array<{
    product_id: string
    product_name_ar: string
    product_name_en: string
    quantity: number
    revenue: number
  }>
}

export default function AdminDashboardPage() {
  const locale = useUIStore((state) => state.locale)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const copy = locale === 'ar'
    ? {
        eyebrow: 'مركز العمليات',
        title: 'لوحة الإدارة',
        description: 'عرض موحد للطلبات والمبيعات والمخزون والتنبيهات اليومية حتى تكون القرارات والإجراءات أسرع.',
        revenue: 'إيرادات هذا الشهر',
        orders: 'طلبات هذا الشهر',
        products: 'المنتجات المنشورة',
        outOfStock: 'نفذ المخزون',
        recentOrders: 'أحدث الطلبات',
        recentOrdersDescription: 'آخر الطلبات التي تحتاج متابعة سريعة من لوحة الإدارة.',
        lowStock: 'تنبيهات المخزون',
        lowStockDescription: 'المنتجات التي اقتربت من حد التنبيه أو أصبحت حرجة.',
        topProducts: 'الأكثر طلباً',
        topProductsDescription: 'أفضل المنتجات أداءً حسب الكمية المباعة.',
        moderation: 'المراجعات والتنبيهات',
        moderationDescription: 'المهام المعلقة التي تحتاج تدخل الإدارة اليوم.',
        viewOrders: 'عرض الطلبات',
        viewProducts: 'عرض المنتجات',
        noRecentOrders: 'لا توجد طلبات حديثة بعد',
        noRecentOrdersDescription: 'عند وصول طلبات جديدة ستظهر هنا لتسهيل المتابعة.',
        noLowStock: 'لا توجد تنبيهات مخزون حالياً',
        noLowStockDescription: 'كل المنتجات في حالة جيدة حالياً.',
        noTopProducts: 'لا توجد بيانات مبيعات كافية بعد',
        noTopProductsDescription: 'ستظهر المنتجات الأكثر طلباً هنا بعد تسجيل الطلبات.',
        order: 'طلب',
        customer: 'العميل',
        total: 'الإجمالي',
        qtySold: 'الكمية المباعة',
        stockLeft: 'المتبقي',
        threshold: 'حد التنبيه',
        commentsPending: 'تعليقات بانتظار المراجعة',
        contactNew: 'رسائل جديدة',
        paymentsSubmitted: 'مدفوعات بانتظار المراجعة',
        vipCustomers: 'عملاء VIP',
        blacklistedCustomers: 'عملاء محظورون',
      }
    : {
        eyebrow: 'Operations center',
        title: 'Admin dashboard',
        description: 'A unified view of orders, sales, inventory, and daily alerts so operational decisions stay fast.',
        revenue: 'Revenue this month',
        orders: 'Orders this month',
        products: 'Published products',
        outOfStock: 'Out of stock',
        recentOrders: 'Recent orders',
        recentOrdersDescription: 'Latest orders that may need fast follow-up from the admin side.',
        lowStock: 'Inventory alerts',
        lowStockDescription: 'Products that are close to or below their low-stock threshold.',
        topProducts: 'Top products',
        topProductsDescription: 'Best performers by quantity sold.',
        moderation: 'Moderation and alerts',
        moderationDescription: 'Pending tasks that need admin action today.',
        viewOrders: 'View orders',
        viewProducts: 'View products',
        noRecentOrders: 'No recent orders yet',
        noRecentOrdersDescription: 'New orders will appear here for faster follow-up.',
        noLowStock: 'No inventory alerts right now',
        noLowStockDescription: 'All products are currently in a healthy stock state.',
        noTopProducts: 'No sales data yet',
        noTopProductsDescription: 'Top-selling products will appear here once orders are recorded.',
        order: 'Order',
        customer: 'Customer',
        total: 'Total',
        qtySold: 'Units sold',
        stockLeft: 'Stock left',
        threshold: 'Alert threshold',
        commentsPending: 'Comments pending review',
        contactNew: 'New messages',
        paymentsSubmitted: 'Payments under review',
        vipCustomers: 'VIP customers',
        blacklistedCustomers: 'Blacklisted customers',
      }

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats')
        const data = await res.json()
        if (data.success) {
          setStats(data.data)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-[24px]" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-[24px]" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={(
          <>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/admin/orders">{copy.viewOrders}</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/admin/products">{copy.viewProducts}</Link>
            </Button>
          </>
        )}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label={copy.revenue}
          value={<bdi>{formatPrice(stats?.revenue?.thisPeriod || 0, 'DZD', locale)}</bdi>}
          icon={DollarSign}
          tone="default"
        />
        <AdminStatCard
          label={copy.orders}
          value={formatNumber(stats?.orders?.thisPeriod || 0, locale)}
          icon={Receipt}
          tone="success"
        />
        <AdminStatCard
          label={copy.products}
          value={formatNumber(stats?.products?.published || 0, locale)}
          icon={Box}
          tone="default"
        />
        <AdminStatCard
          label={copy.outOfStock}
          value={formatNumber(stats?.products?.outOfStock || 0, locale)}
          icon={AlertTriangle}
          tone={stats?.products?.outOfStock ? 'danger' : 'warning'}
          meta={stats?.products?.lowStock ? `${formatNumber(stats.products.lowStock, locale)} ${locale === 'ar' ? 'قريب من النفاد' : 'low-stock soon'}` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.9fr_0.9fr]">
        <AdminPanel title={copy.recentOrders} description={copy.recentOrdersDescription}>
          {stats?.recentOrders?.length ? (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-white/70 px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-soft">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{order.order_number}</p>
                    <p className="truncate text-sm text-muted-foreground">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-secondary"><bdi>{formatPrice(order.total, 'DZD', locale)}</bdi></p>
                    <p className="text-xs text-muted-foreground">{order.payment_status}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <AdminEmptyState title={copy.noRecentOrders} description={copy.noRecentOrdersDescription} />
          )}
        </AdminPanel>

        <AdminPanel title={copy.lowStock} description={copy.lowStockDescription}>
          {stats?.lowStockProducts?.length ? (
            <div className="space-y-3">
              {stats.lowStockProducts.map((product) => (
                <Link key={product.id} href={`/admin/products/${product.id}/edit`} className="block rounded-2xl border border-border/70 bg-white/70 px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-soft">
                  <p className="font-semibold text-foreground">{locale === 'ar' ? product.name_ar : product.name_en}</p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{copy.stockLeft}</span>
                    <span className="font-semibold text-amber-700">{formatNumber(product.stock_quantity, locale)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{copy.threshold}</span>
                    <span>{formatNumber(product.low_stock_threshold || 0, locale)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <AdminEmptyState title={copy.noLowStock} description={copy.noLowStockDescription} />
          )}
        </AdminPanel>

        <AdminPanel title={copy.topProducts} description={copy.topProductsDescription}>
          {stats?.topProducts?.length ? (
            <div className="space-y-3">
              {stats.topProducts.map((product) => (
                <div key={product.product_id} className="rounded-2xl border border-border/70 bg-white/70 px-4 py-3">
                  <p className="font-semibold text-foreground">{locale === 'ar' ? product.product_name_ar : product.product_name_en}</p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{copy.qtySold}</span>
                    <span className="font-semibold text-secondary">{formatNumber(product.quantity, locale)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{copy.total}</span>
                    <bdi>{formatPrice(product.revenue, 'DZD', locale)}</bdi>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AdminEmptyState title={copy.noTopProducts} description={copy.noTopProductsDescription} />
          )}
        </AdminPanel>
      </div>

      <AdminPanel title={copy.moderation} description={copy.moderationDescription}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <AdminStatCard label={copy.commentsPending} value={formatNumber(stats?.moderation?.commentsPending || 0, locale)} icon={Sparkles} tone="warning" />
          <AdminStatCard label={copy.contactNew} value={formatNumber(stats?.moderation?.contactNew || 0, locale)} icon={TrendingUp} tone="default" />
          <AdminStatCard label={copy.paymentsSubmitted} value={formatNumber(stats?.moderation?.paymentsSubmitted || 0, locale)} icon={Receipt} tone="warning" />
          <AdminStatCard label={copy.vipCustomers} value={formatNumber(stats?.customerFlags?.vip || 0, locale)} icon={Sparkles} tone="success" />
          <AdminStatCard label={copy.blacklistedCustomers} value={formatNumber(stats?.customerFlags?.blacklisted || 0, locale)} icon={AlertTriangle} tone="danger" />
        </div>
      </AdminPanel>
    </div>
  )
}
