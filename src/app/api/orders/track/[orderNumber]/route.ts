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

    return NextResponse.json({ success: true, data: { ...order, items: items || [] } })
  } catch {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}
