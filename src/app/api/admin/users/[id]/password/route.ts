import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { supabaseServer } from '@/lib/supabase/server'
import { hashPassword } from '@/lib/auth/password'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const body = await request.json()
    const nextPassword = typeof body.password === 'string' ? body.password : ''

    if (
      nextPassword.length < 8 ||
      !/[A-Z]/.test(nextPassword) ||
      !/[a-z]/.test(nextPassword) ||
      !/[0-9]/.test(nextPassword) ||
      !/[!@#$%^&*]/.test(nextPassword)
    ) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Password must include upper, lower, number, and special character' } },
        { status: 400 }
      )
    }

    const passwordHash = await hashPassword(nextPassword)
    const { error } = await supabaseServer
      .from('users')
      .update({
        password_hash: passwordHash,
        password_changed_at: new Date().toISOString(),
        failed_login_attempts: 0,
        locked_until: null,
      })
      .eq('id', params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal server error' } },
      { status: 500 }
    )
  }
}
