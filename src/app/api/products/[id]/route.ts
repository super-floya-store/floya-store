import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'
import { productUpdateSchema } from '@/lib/validations/product'
import { getAvailableDigitalUnitCount, getProductVariants, recalculateProductAggregates, syncProductChildren } from '@/lib/products/inventory'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const includeUnpublished = _request.nextUrl.searchParams.get('includeUnpublished') === 'true'

    if (includeUnpublished) {
      await requireAdmin(_request)
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

    const variants = await getProductVariants(data.id)
    const availableDigitalUnits = data.product_type === 'digital_account' || data.product_type === 'digital_text' ? await getAvailableDigitalUnitCount(data.id) : 0

    let digitalInventoryUnits: any[] | undefined
    if (includeUnpublished && (data.product_type === 'digital_account' || data.product_type === 'digital_text')) {
      const { data: units } = await supabaseServer
        .from('digital_inventory_units')
        .select('*')
        .eq('product_id', data.id)
        .order('created_at', { ascending: true })
      digitalInventoryUnits = units || []
    }

    return NextResponse.json({ success: true, data: { ...data, variants, available_digital_units: availableDigitalUnits, digital_inventory_units: digitalInventoryUnits } })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const result = productUpdateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid product data' } },
        { status: 400 }
      )
    }

    const { variants: submittedVariants, digital_inventory_units: submittedDigitalInventoryUnits, ...productPayload } = result.data

    const { data, error } = await supabaseServer
      .from('products')
      .update(productPayload)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    await syncProductChildren(params.id, result.data)
    await recalculateProductAggregates(params.id, result.data)
    const variants = await getProductVariants(params.id)
    const availableDigitalUnits = data.product_type === 'digital_account' || data.product_type === 'digital_text' ? await getAvailableDigitalUnitCount(params.id) : 0

    return NextResponse.json({ success: true, data: { ...data, variants, available_digital_units: availableDigitalUnits } })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(_request)

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

      const { data } = await supabaseServer
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single()

      return NextResponse.json({ success: true, data, message: 'Product unpublished (has existing orders)', softDeleted: true })
    }

    const { error: digitalUnitsError } = await supabaseServer
      .from('digital_inventory_units')
      .delete()
      .eq('product_id', params.id)

    if (digitalUnitsError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: digitalUnitsError.message } },
        { status: 500 }
      )
    }

    const { error: variantsError } = await supabaseServer
      .from('product_variants')
      .delete()
      .eq('product_id', params.id)

    if (variantsError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: variantsError.message } },
        { status: 500 }
      )
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
