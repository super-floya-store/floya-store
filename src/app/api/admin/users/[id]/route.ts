import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { supabaseServer } from '@/lib/supabase/server'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (typeof body.is_vip === 'boolean') updates.is_vip = body.is_vip
    if (typeof body.is_active === 'boolean') updates.is_active = body.is_active
    if (typeof body.full_name === 'string') updates.full_name = body.full_name.trim()

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No valid updates provided' } }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from('users')
      .update(updates)
      .eq('id', params.id)
      .select('id, email, full_name, role, is_vip, is_active, last_login_at, created_at')
      .single()

    if (error) {
      throw error
    }

    if (typeof body.is_vip === 'boolean') {
      await supabaseServer.from('customer_profiles').update({ is_vip: body.is_vip }).eq('user_id', params.id)
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal server error' } },
      { status: 500 }
    )
  }
}
