import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { supabaseServer } from '@/lib/supabase/server'
import { supplierSchema } from '@/lib/validations/supplier'

export async function GET() {
  try {
    await requireAdmin()
    const { data, error } = await supabaseServer.from('suppliers').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal server error' } }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const result = supplierSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid supplier data' } }, { status: 400 })
    }
    const { data, error } = await supabaseServer.from('suppliers').insert(result.data).select('*').single()
    if (error) throw error
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal server error' } }, { status: 500 })
  }
}
