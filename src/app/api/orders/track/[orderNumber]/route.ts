import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(_request: Request, { params }: { params: { orderNumber: string } }) {
  try {
    const { data: order, error } = await supabaseServer
      .from('orders')
      .select('*')
      .eq('order_number', params.orderNumber)
      .single()

    if (error || !order) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } }, { status: 404 })
    }

    const { data: items } = await supabaseServer.from('order_items').select('*').eq('order_id', order.id)
    const orderItemIds = (items || []).map((item) => item.id)
    const { data: digitalUnits } = orderItemIds.length
      ? await supabaseServer
        .from('digital_inventory_units')
        .select('id, order_item_id, title, payload')
        .in('order_item_id', orderItemIds)
        .eq('status', 'delivered')
      : { data: [] as any[] }

    const unitsByOrderItemId = new Map<string, any[]>()
    for (const unit of digitalUnits || []) {
      const current = unitsByOrderItemId.get(unit.order_item_id) || []
      current.push(unit)
      unitsByOrderItemId.set(unit.order_item_id, current)
    }

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        items: (items || []).map((item) => ({
          ...item,
          delivered_units: unitsByOrderItemId.get(item.id) || [],
        })),
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}
