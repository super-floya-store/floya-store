import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'
import { commentSchema } from '@/lib/validations/comment'
import { getStoreSettings } from '@/lib/settings/store-settings'
import { buildNewCommentEmail } from '@/lib/email/templates'
import { sendResendEmail } from '@/lib/email/resend'
import type { Comment } from '@/types/comment'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')
    const status = searchParams.get('status')
    const includePending = searchParams.get('includePending') === 'true'

    let query = supabaseServer.from('comments').select('*').order('created_at', { ascending: false })

    if (entityType) query = query.eq('entity_type', entityType)
    if (entityId) query = query.eq('entity_id', entityId)

    if (includePending) {
      await requireAdmin()
      if (status) {
        query = query.eq('status', status)
      }
    } else {
      query = query.eq('status', 'approved')
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = commentSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid comment data' } },
        { status: 400 }
      )
    }

    const payload = {
      entity_type: result.data.entityType,
      entity_id: result.data.entityId,
      customer_name: result.data.customerName.trim(),
      customer_email: result.data.customerEmail || null,
      rating: result.data.rating,
      comment: result.data.comment.trim(),
    }

    const { data, error } = await supabaseServer.from('comments').insert(payload).select('*').single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: error?.message || 'Failed to save comment' } },
        { status: 500 }
      )
    }

    const settings = await getStoreSettings()
    const adminEmail = settings.admin_notification_email || settings.store_email

    if (adminEmail) {
      const email = buildNewCommentEmail(data as Comment, settings)
      const fromName = settings.email_sender_name || settings.store_name?.ar || 'Floya Store'
      const fromAddress = settings.email_sender_address || 'onboarding@resend.dev'

      await sendResendEmail({
        from: `${fromName} <${fromAddress}>`,
        to: adminEmail,
        subject: email.subject,
        html: email.html,
      }).catch((sendError) => {
        console.error('Comment email error:', sendError)
      })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
