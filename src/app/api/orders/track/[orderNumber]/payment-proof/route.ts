import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { supabaseServer } from '@/lib/supabase/server'
import { getStoreSettings } from '@/lib/settings/store-settings'
import { sendResendEmail } from '@/lib/email/resend'

export async function POST(request: NextRequest, { params }: { params: { orderNumber: string } }) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const transactionId = String(formData.get('transactionId') || '').trim()

    if (!file || !transactionId) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'الصورة ورقم العملية مطلوبان' } }, { status: 400 })
    }

    const { data: order, error: orderError } = await supabaseServer.from('orders').select('*').eq('order_number', params.orderNumber).single()
    if (orderError || !order) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'الطلب غير موجود' } }, { status: 404 })
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const resized = await sharp(fileBuffer).rotate().resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toBuffer()
    const path = `payments/${order.id}-${Date.now()}.webp`

    const { error: uploadError } = await supabaseServer.storage.from('store-media').upload(path, resized, {
      contentType: 'image/webp',
      upsert: true,
    })

    if (uploadError) {
      return NextResponse.json({ success: false, error: { code: 'UPLOAD_ERROR', message: uploadError.message } }, { status: 500 })
    }

    const { data: publicData } = supabaseServer.storage.from('store-media').getPublicUrl(path)

    const { data, error } = await supabaseServer
      .from('orders')
      .update({
        payment_transaction_id: transactionId,
        payment_receipt_url: publicData.publicUrl,
        payment_submitted_at: new Date().toISOString(),
        payment_status: 'submitted',
      })
      .eq('id', order.id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: { code: 'DATABASE_ERROR', message: error.message } }, { status: 500 })
    }

    const settings = await getStoreSettings()
    const adminEmail = settings.admin_notification_email || settings.store_email
    if (adminEmail) {
      await sendResendEmail({
        from: `${settings.email_sender_name || settings.store_name?.en || settings.store_name?.ar || 'Store'} <${settings.email_sender_address || 'onboarding@resend.dev'}>`,
        to: adminEmail,
        subject: `إثبات دفع جديد للطلب ${params.orderNumber}`,
        html: `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.9"><h2>إثبات دفع جديد</h2><p><strong>رقم الطلب:</strong> ${params.orderNumber}</p><p><strong>رقم العملية:</strong> ${transactionId}</p><p><a href="${publicData.publicUrl}">عرض الصورة</a></p></div>`,
      }).catch(() => {})
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Payment proof error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}
