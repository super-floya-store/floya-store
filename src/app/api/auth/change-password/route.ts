import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { comparePassword, hashPassword } from '@/lib/auth/password'
import { supabaseServer } from '@/lib/supabase/server'
import { changePasswordSchema } from '@/lib/validations/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = changePasswordSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid password data' } },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = result.data

    const { data: user } = await supabaseServer
      .from('users')
      .select('password_hash')
      .eq('id', session.user.id)
      .single()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      )
    }

    const isValid = await comparePassword(currentPassword, user.password_hash)

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect' } },
        { status: 400 }
      )
    }

    const newHash = await hashPassword(newPassword)

    await supabaseServer
      .from('users')
      .update({
        password_hash: newHash,
        password_changed_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)

    return NextResponse.json({ success: true, message: 'Password changed successfully' })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
