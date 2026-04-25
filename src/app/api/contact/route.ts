import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'
import { getStoreSettings } from '@/lib/settings/store-settings'
import { sendResendEmail } from '@/lib/email/resend'

export async function GET() {
  try {
    await requireAdmin()
    const { data, error } = await supabaseServer.from('contact_messages').select('*').order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, error: { code: 'DATABASE_ERROR', message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const payload = {
      customer_name: String(body.customerName || '').trim(),
      customer_email: body.customerEmail ? String(body.customerEmail).trim() : null,
      customer_phone: body.customerPhone ? String(body.customerPhone).trim() : null,
      subject: body.subject ? String(body.subject).trim() : null,
      message: String(body.message || '').trim(),
    }

    if (!payload.customer_name || !payload.message) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'الاسم والرسالة مطلوبان' } }, { status: 400 })
    }

    const { data, error } = await supabaseServer.from('contact_messages').insert(payload).select('*').single()
    if (error || !data) {
      return NextResponse.json({ success: false, error: { code: 'DATABASE_ERROR', message: error?.message || 'Failed to save message' } }, { status: 500 })
    }

    const settings = await getStoreSettings()
    const adminEmail = settings.admin_notification_email || settings.store_email
    if (adminEmail) {
      await sendResendEmail({
        from: `${settings.email_sender_name || 'Floya Store'} <${settings.email_sender_address || 'onboarding@resend.dev'}>`,
        to: adminEmail,
        subject: `رسالة تواصل جديدة${payload.subject ? ` - ${payload.subject}` : ''}`,
        html: `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.9"><h2>رسالة جديدة من الموقع</h2><p><strong>الاسم:</strong> ${payload.customer_name}</p><p><strong>البريد:</strong> ${payload.customer_email || '-'}</p><p><strong>الهاتف:</strong> ${payload.customer_phone || '-'}</p><p><strong>الموضوع:</strong> ${payload.subject || '-'}</p><p><strong>الرسالة:</strong><br/>${payload.message}</p></div>`,
      }).catch(() => {})
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}
