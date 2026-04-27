import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET() {
  try {
    const session = await requireAuth()
    const { data: orders, error } = await supabaseServer
      .from('orders')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    const orderIds = (orders || []).map((order) => order.id)
    const { data: items } = orderIds.length
      ? await supabaseServer.from('order_items').select('*').in('order_id', orderIds)
      : { data: [] as any[] }

    const itemsByOrderId = new Map<string, any[]>()
    for (const item of items || []) {
      const current = itemsByOrderId.get(item.order_id) || []
      current.push(item)
      itemsByOrderId.set(item.order_id, current)
    }

    return NextResponse.json({
      success: true,
      data: (orders || []).map((order) => ({
        ...order,
        items: itemsByOrderId.get(order.id) || [],
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal server error' } },
      { status: 500 }
    )
  }
}
