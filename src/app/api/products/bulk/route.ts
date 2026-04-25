import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/session'
import { supabaseServer } from '@/lib/supabase/server'

const bulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  action: z.enum(['publish', 'unpublish', 'set_stock', 'adjust_stock', 'set_price', 'adjust_price_percent']),
  value: z.number().optional(),
})

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const result = bulkSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid bulk operation' } }, { status: 400 })
    }

    const { ids, action, value } = result.data

    if (action === 'publish' || action === 'unpublish') {
      const { error } = await supabaseServer.from('products').update({ is_published: action === 'publish' }).in('id', ids)
      if (error) throw error
    }

    if (action === 'set_stock') {
      const { error } = await supabaseServer.from('products').update({ stock_quantity: Math.max(0, Math.round(value || 0)) }).in('id', ids)
      if (error) throw error
    }

    if (action === 'adjust_stock' || action === 'set_price' || action === 'adjust_price_percent') {
      const { data: products, error: fetchError } = await supabaseServer.from('products').select('id, stock_quantity, price').in('id', ids)
      if (fetchError) throw fetchError

      for (const product of products || []) {
        if (action === 'adjust_stock') {
          const nextStock = Math.max(0, product.stock_quantity + Math.round(value || 0))
          const { error } = await supabaseServer.from('products').update({ stock_quantity: nextStock }).eq('id', product.id)
          if (error) throw error
        }

        if (action === 'set_price') {
          const { error } = await supabaseServer.from('products').update({ price: value || 0 }).eq('id', product.id)
          if (error) throw error
        }

        if (action === 'adjust_price_percent') {
          const nextPrice = Math.max(0, product.price * (1 + (value || 0) / 100))
          const { error } = await supabaseServer.from('products').update({ price: Number(nextPrice.toFixed(2)) }).eq('id', product.id)
          if (error) throw error
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal server error' } },
      { status: 500 }
    )
  }
}
