import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { supabaseServer } from '@/lib/supabase/server'
import { supplierUpdateSchema } from '@/lib/validations/supplier'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const body = await request.json()
    const result = supplierUpdateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid supplier data' } }, { status: 400 })
    }
    const { data, error } = await supabaseServer.from('suppliers').update(result.data).eq('id', params.id).select('*').single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal server error' } }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const { error } = await supabaseServer.from('suppliers').delete().eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal server error' } }, { status: 500 })
  }
}
