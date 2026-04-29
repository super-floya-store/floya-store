import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'

    const now = new Date()
    let dateFrom = new Date()

    switch (period) {
      case 'today':
        dateFrom.setHours(0, 0, 0, 0)
        break
      case 'week':
        dateFrom.setDate(now.getDate() - 7)
        break
      case 'month':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        dateFrom = new Date(now.getFullYear(), 0, 1)
        break
      default:
        dateFrom = new Date('2000-01-01')
    }

    const { data: orderPeriodData } = await supabaseServer
      .from('orders')
      .select('total, status, payment_status, refund_status')
      .gte('created_at', dateFrom.toISOString())
    const { count: publishedProducts } = await supabaseServer
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)
    const { count: outOfStock } = await supabaseServer
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('stock_quantity', 0)
    const { count: lowStock } = await supabaseServer
      .from('products')
      .select('*', { count: 'exact', head: true })
      .gt('stock_quantity', 0)
      .lt('stock_quantity', 5)

    const { count: commentsPending } = await supabaseServer.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    const { count: contactNew } = await supabaseServer.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'new')
    const { count: paymentsSubmitted } = await supabaseServer.from('orders').select('*', { count: 'exact', head: true }).eq('payment_status', 'submitted')
    const { count: blacklistedCustomers } = await supabaseServer.from('customer_profiles').select('*', { count: 'exact', head: true }).eq('is_blacklisted', true)
    const { count: vipCustomers } = await supabaseServer.from('customer_profiles').select('*', { count: 'exact', head: true }).eq('is_vip', true)

    const { count: totalProducts } = await supabaseServer.from('products').select('*', { count: 'exact', head: true })
    const { data: recentOrders } = await supabaseServer
      .from('orders')
      .select('id, order_number, customer_name, total, status, payment_status, created_at')
      .order('created_at', { ascending: false })
      .limit(6)
    const { data: lowStockProducts } = await supabaseServer
      .from('products')
      .select('id, name_ar, name_en, slug, stock_quantity, low_stock_threshold, is_published')
      .gt('stock_quantity', 0)
      .lt('stock_quantity', 5)
      .order('stock_quantity', { ascending: true })
      .limit(6)
    const { data: topProducts } = await supabaseServer
      .from('order_items')
      .select('product_id, product_name_ar, product_name_en, quantity, total_price')

    const payableOrders = (orderPeriodData || []).filter((order) => order.payment_status === 'paid' && order.refund_status !== 'refunded')
    const revenue = payableOrders.reduce((sum, order) => sum + (order.total || 0), 0)
    const totalOrders = orderPeriodData?.length || 0
    const topProductsMap = new Map<string, { product_id: string; product_name_ar: string; product_name_en: string; quantity: number; revenue: number }>()

    for (const item of topProducts || []) {
      const current = topProductsMap.get(item.product_id) || {
        product_id: item.product_id,
        product_name_ar: item.product_name_ar,
        product_name_en: item.product_name_en,
        quantity: 0,
        revenue: 0,
      }
      current.quantity += item.quantity || 0
      current.revenue += item.total_price || 0
      topProductsMap.set(item.product_id, current)
    }

    const byStatus = {
      pending: orderPeriodData?.filter((o) => o.status === 'pending').length || 0,
      confirmed: orderPeriodData?.filter((o) => o.status === 'confirmed').length || 0,
      processing: orderPeriodData?.filter((o) => o.status === 'processing').length || 0,
      shipped: orderPeriodData?.filter((o) => o.status === 'shipped').length || 0,
      delivered: orderPeriodData?.filter((o) => o.status === 'delivered').length || 0,
      cancelled: orderPeriodData?.filter((o) => o.status === 'cancelled').length || 0,
    }

    return NextResponse.json({
      success: true,
      data: {
        revenue: { total: revenue, thisPeriod: revenue, change: 0 },
        orders: { total: totalOrders, thisPeriod: totalOrders, byStatus, change: 0 },
        products: { total: totalProducts || 0, published: publishedProducts || 0, outOfStock: outOfStock || 0, lowStock: lowStock || 0 },
        customers: { total: totalOrders, thisPeriod: totalOrders, returning: 0 },
        moderation: { commentsPending: commentsPending || 0, contactNew: contactNew || 0, paymentsSubmitted: paymentsSubmitted || 0 },
        customerFlags: { blacklisted: blacklistedCustomers || 0, vip: vipCustomers || 0 },
        topProducts: Array.from(topProductsMap.values())
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5),
        recentOrders: recentOrders || [],
        lowStockProducts: lowStockProducts || [],
        revenueByDay: [],
        ordersByWilaya: [],
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
