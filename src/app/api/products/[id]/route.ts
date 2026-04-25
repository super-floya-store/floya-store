import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'
import { productUpdateSchema } from '@/lib/validations/product'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const includeUnpublished = _request.nextUrl.searchParams.get('includeUnpublished') === 'true'

    if (includeUnpublished) {
      await requireAdmin()
    }

    let query = supabaseServer
      .from('products')
      .select('*, category:categories(*)')
      .eq('id', params.id)

    if (!includeUnpublished) {
      query = query.eq('is_published', true)
    }

    const { data, error } = await query.single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const body = await request.json()
    const result = productUpdateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid product data' } },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseServer
      .from('products')
      .update(result.data)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()

    const { data: orderItems } = await supabaseServer
      .from('order_items')
      .select('id')
      .eq('product_id', params.id)
      .limit(1)

    if (orderItems && orderItems.length > 0) {
      const { error } = await supabaseServer
        .from('products')
        .update({ is_published: false })
        .eq('id', params.id)

      if (error) {
        return NextResponse.json(
          { success: false, error: { code: 'DATABASE_ERROR', message: error.message } },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, message: 'Product unpublished (has existing orders)' })
    }

    const { error } = await supabaseServer.from('products').delete().eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Product deleted' })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
