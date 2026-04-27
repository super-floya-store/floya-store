import { NextRequest, NextResponse } from 'next/server'
import { resetPasswordSchema } from '@/lib/validations/auth'
import { verifyPasswordResetToken } from '@/lib/auth/password-reset'
import { supabaseServer } from '@/lib/supabase/server'
import { hashPassword } from '@/lib/auth/password'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = resetPasswordSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: result.error.issues[0]?.message || 'Invalid input' } },
        { status: 400 }
      )
    }

    const payload = verifyPasswordResetToken(result.data.token)
    if (payload.type !== 'password_reset') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TOKEN', message: 'Reset link is invalid' } },
        { status: 400 }
      )
    }

    const passwordHash = await hashPassword(result.data.password)
    const { error } = await supabaseServer
      .from('users')
      .update({
        password_hash: passwordHash,
        password_changed_at: new Date().toISOString(),
        failed_login_attempts: 0,
        locked_until: null,
      })
      .eq('id', payload.userId)
      .eq('email', payload.email)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_TOKEN', message: 'Reset link is invalid or expired' } },
      { status: 400 }
    )
  }
}
