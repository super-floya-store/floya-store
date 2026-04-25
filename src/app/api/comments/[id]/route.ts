import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { supabaseServer } from '@/lib/supabase/server'
import { commentModerationSchema } from '@/lib/validations/comment'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin()
    const body = await request.json()
    const result = commentModerationSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid moderation data' } },
        { status: 400 }
      )
    }

    const updates: Record<string, any> = {
      status: result.data.status,
      admin_notes: result.data.adminNotes || null,
    }

    if (result.data.status === 'approved') {
      updates.approved_at = new Date().toISOString()
      updates.approved_by = session.user.id
    }

    const { data, error } = await supabaseServer
      .from('comments')
      .update(updates)
      .eq('id', params.id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
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
