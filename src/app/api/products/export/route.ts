import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { supabaseServer } from '@/lib/supabase/server'
import { toCsv } from '@/lib/csv'

export async function GET() {
  try {
    await requireAdmin()
    const { data, error } = await supabaseServer
      .from('products')
      .select('id,name_ar,name_en,price,promo_price,stock_quantity,is_published,is_featured,category_id,images,supplier_id,low_stock_threshold')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, error: { code: 'DATABASE_ERROR', message: error.message } }, { status: 500 })
    }

    const csv = toCsv([
      ['id', 'name_ar', 'name_en', 'price', 'promo_price', 'stock_quantity', 'is_published', 'is_featured', 'category_id', 'images', 'supplier_id', 'low_stock_threshold'],
      ...(data || []).map((product) => [
        product.id,
        product.name_ar,
        product.name_en,
        product.price,
        product.promo_price,
        product.stock_quantity,
        product.is_published,
        product.is_featured,
        product.category_id,
        (product.images || []).join('|'),
        product.supplier_id,
        product.low_stock_threshold,
      ]),
    ])

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="products-export.csv"',
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}
