import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'
import { categoryUpdateSchema } from '@/lib/validations/category'

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabaseServer
      .from('categories')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } },
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
    const result = categoryUpdateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid category data' } },
        { status: 400 }
      )
    }

    const updateData = { ...result.data }

    if (typeof updateData.slug === 'string') {
      updateData.slug = normalizeSlug(updateData.slug)
    } else if (typeof updateData.name_en === 'string') {
      updateData.slug = normalizeSlug(updateData.name_en)
    }

    const { data, error } = await supabaseServer
      .from('categories')
      .update(updateData)
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
  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()

    const { data: products } = await supabaseServer
      .from('products')
      .select('id')
      .eq('category_id', params.id)
      .limit(1)

    if (products && products.length > 0) {
      return NextResponse.json(
        { success: false, error: { code: 'CONFLICT', message: 'Cannot delete category with products' } },
        { status: 409 }
      )
    }

    const { error } = await supabaseServer.from('categories').delete().eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Category deleted' })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal server error' } },
      { status: 500 }
    )
  }
}
