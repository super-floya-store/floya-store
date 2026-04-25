import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { supabaseServer } from '@/lib/supabase/server'
import { parseCsvLine } from '@/lib/csv'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const { csv } = await request.json()

    if (!csv || typeof csv !== 'string') {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'CSV content is required' } }, { status: 400 })
    }

    const lines = csv.split(/\r?\n/).filter((line) => line.trim())
    if (lines.length < 2) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'CSV is empty' } }, { status: 400 })
    }

    const headers = parseCsvLine(lines[0])
    const index = (name: string) => headers.indexOf(name)
    const inserted: string[] = []

    for (const line of lines.slice(1)) {
      const row = parseCsvLine(line)
      const payload = {
        name_ar: row[index('name_ar')] || '',
        name_en: row[index('name_en')] || '',
        price: Number(row[index('price')] || 0),
        promo_price: row[index('promo_price')] ? Number(row[index('promo_price')]) : null,
        stock_quantity: Number(row[index('stock_quantity')] || 0),
        is_published: (row[index('is_published')] || 'true') === 'true',
        is_featured: (row[index('is_featured')] || 'false') === 'true',
        category_id: row[index('category_id')] || null,
        images: (row[index('images')] || '').split('|').map((item) => item.trim()).filter(Boolean),
        supplier_id: row[index('supplier_id')] || null,
        low_stock_threshold: Number(row[index('low_stock_threshold')] || 3),
      }

      if (!payload.name_ar || !payload.name_en || !payload.category_id) continue

      const { error } = await supabaseServer.from('products').insert(payload)
      if (!error) inserted.push(payload.name_ar)
    }

    return NextResponse.json({ success: true, data: { insertedCount: inserted.length, inserted } })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal server error' } },
      { status: 500 }
    )
  }
}
