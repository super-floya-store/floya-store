import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET() {
  try {
    await requireAdmin()
    const { data, error } = await supabaseServer.from('customer_profiles').select('*').order('updated_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal server error' } }, { status: 500 })
  }
}
