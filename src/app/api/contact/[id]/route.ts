import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { supabaseServer } from '@/lib/supabase/server'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const body = await request.json()
    const { data, error } = await supabaseServer.from('contact_messages').update({ status: body.status }).eq('id', params.id).select('*').single()
    if (error) {
      return NextResponse.json({ success: false, error: { code: 'DATABASE_ERROR', message: error.message } }, { status: 500 })
    }
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}
