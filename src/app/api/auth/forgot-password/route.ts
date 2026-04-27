import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { forgotPasswordSchema } from '@/lib/validations/auth'
import { generatePasswordResetToken } from '@/lib/auth/password-reset'
import { getStoreSettings } from '@/lib/settings/store-settings'
import { sendResendEmail } from '@/lib/email/resend'
import { env } from '@/config/env'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = forgotPasswordSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: result.error.issues[0]?.message || 'Invalid input' } },
        { status: 400 }
      )
    }

    const email = result.data.email.trim().toLowerCase()
    const { data: user } = await supabaseServer
      .from('users')
      .select('id, email, full_name, is_active')
      .eq('email', email)
      .maybeSingle()

    if (user?.is_active) {
      const settings = await getStoreSettings()
      const appUrl = env.NEXT_PUBLIC_APP_URL.startsWith('http') ? env.NEXT_PUBLIC_APP_URL : `https://${env.NEXT_PUBLIC_APP_URL}`
      const token = generatePasswordResetToken(user.id, user.email)
      const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`
      const brandName = settings.store_name?.en || settings.store_name?.ar || 'Floya Store'
      const fromName = settings.email_sender_name || brandName
      const fromAddress = settings.email_sender_address || 'onboarding@resend.dev'

      await sendResendEmail({
        from: `${fromName} <${fromAddress}>`,
        to: user.email,
        subject: `Reset your ${brandName} password`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#111827"><h2>Password reset</h2><p>We received a request to reset your password for ${brandName}.</p><p><a href="${resetUrl}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#111827;color:#ffffff;text-decoration:none">Reset password</a></p><p>This link expires in 1 hour.</p></div>`,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'If the email exists, a reset link has been sent',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal server error' } },
      { status: 500 }
    )
  }
}
