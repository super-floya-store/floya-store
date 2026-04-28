import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'
import { productSchema } from '@/lib/validations/product'
import { getAvailableDigitalUnitCount, getProductVariants, syncProductChildren } from '@/lib/products/inventory'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true'
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const featured = searchParams.get('featured')
    const inStock = searchParams.get('inStock')

    let query = supabaseServer
      .from('products')
      .select('*, category:categories(*)', { count: 'exact' })

    if (includeUnpublished) {
      await requireAdmin(request)
    } else {
      query = query.eq('is_published', true)
    }

    if (category) {
      if (/^[0-9a-fA-F-]{36}$/.test(category)) {
        query = query.eq('category_id', category)
      } else {
        const { data: matchedCategory, error: categoryError } = await supabaseServer
          .from('categories')
          .select('id')
          .eq('slug', category)
          .single()

        if (categoryError || !matchedCategory) {
          return NextResponse.json({
            success: true,
            data: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: page > 1,
            },
          })
        }

        query = query.eq('category_id', matchedCategory.id)
      }
    }

    if (search) {
      query = query.or(`name_ar.ilike.%${search}%,name_en.ilike.%${search}%`)
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice))
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice))
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    if (inStock === 'true') {
      query = query.gt('stock_quantity', 0)
    }

    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'name_asc':
        query = query.order('name_ar', { ascending: true })
        break
      case 'name_desc':
        query = query.order('name_ar', { ascending: false })
        break
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Products fetch error:', error)
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch products' } },
        { status: 500 }
      )
    }

    const rows = await Promise.all((data || []).map(async (product) => {
      const variants = await getProductVariants(product.id)
      const availableDigitalUnits = product.product_type === 'digital_account' || product.product_type === 'digital_text'
        ? await getAvailableDigitalUnitCount(product.id)
        : 0

      return {
        ...product,
        variants,
        available_digital_units: availableDigitalUnits,
      }
    }))

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: page * limit < (count || 0),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('Products error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const result = productSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid product data', details: result.error.message } },
        { status: 400 }
      )
    }

    const { variants: submittedVariants, digital_inventory_units: submittedDigitalInventoryUnits, ...productPayload } = result.data

    const { data, error } = await supabaseServer
      .from('products')
      .insert({
        ...productPayload,
        product_type: productPayload.product_type,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    await syncProductChildren(data.id, result.data)

    const variants = await getProductVariants(data.id)
    const availableDigitalUnits = data.product_type === 'digital_account' || data.product_type === 'digital_text' ? await getAvailableDigitalUnitCount(data.id) : 0

    return NextResponse.json({ success: true, data: { ...data, variants, available_digital_units: availableDigitalUnits } }, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
