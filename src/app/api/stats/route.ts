import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
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
        dateFrom.setMonth(now.getMonth() - 1)
        break
      case 'year':
        dateFrom.setFullYear(now.getFullYear() - 1)
        break
      default:
        dateFrom = new Date('2000-01-01')
    }

    const { data: revenueData } = await supabaseServer
      .from('orders')
      .select('total')
      .gte('created_at', dateFrom.toISOString())
      .eq('status', 'delivered')

    const { data: ordersData } = await supabaseServer
      .from('orders')
      .select('status')
      .gte('created_at', dateFrom.toISOString())

    const { data: productsData } = await supabaseServer
      .from('products')
      .select('is_published, stock_quantity')

    const { count: commentsPending } = await supabaseServer.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    const { count: contactNew } = await supabaseServer.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'new')
    const { count: paymentsSubmitted } = await supabaseServer.from('orders').select('*', { count: 'exact', head: true }).eq('payment_status', 'submitted')
    const { count: blacklistedCustomers } = await supabaseServer.from('customer_profiles').select('*', { count: 'exact', head: true }).eq('is_blacklisted', true)
    const { count: vipCustomers } = await supabaseServer.from('customer_profiles').select('*', { count: 'exact', head: true }).eq('is_vip', true)

    const { count: totalProducts } = await supabaseServer.from('products').select('*', { count: 'exact', head: true })

    const revenue = revenueData?.reduce((sum, o) => sum + (o.total || 0), 0) || 0
    const totalOrders = ordersData?.length || 0
    const publishedProducts = productsData?.filter((p) => p.is_published).length || 0
    const outOfStock = productsData?.filter((p) => p.stock_quantity === 0).length || 0
    const lowStock = productsData?.filter((p) => p.stock_quantity > 0 && p.stock_quantity < 5).length || 0

    const byStatus = {
      pending: ordersData?.filter((o) => o.status === 'pending').length || 0,
      confirmed: ordersData?.filter((o) => o.status === 'confirmed').length || 0,
      processing: ordersData?.filter((o) => o.status === 'processing').length || 0,
      shipped: ordersData?.filter((o) => o.status === 'shipped').length || 0,
      delivered: ordersData?.filter((o) => o.status === 'delivered').length || 0,
      cancelled: ordersData?.filter((o) => o.status === 'cancelled').length || 0,
    }

    return NextResponse.json({
      success: true,
      data: {
        revenue: { total: revenue, thisPeriod: revenue, change: 0 },
        orders: { total: totalOrders, thisPeriod: totalOrders, byStatus, change: 0 },
        products: { total: totalProducts || 0, published: publishedProducts, outOfStock, lowStock },
        customers: { total: totalOrders, thisPeriod: totalOrders, returning: 0 },
        moderation: { commentsPending: commentsPending || 0, contactNew: contactNew || 0, paymentsSubmitted: paymentsSubmitted || 0 },
        customerFlags: { blacklisted: blacklistedCustomers || 0, vip: vipCustomers || 0 },
        topProducts: [],
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
