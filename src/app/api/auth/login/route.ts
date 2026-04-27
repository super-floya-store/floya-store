import { NextRequest, NextResponse } from 'next/server'
import { comparePassword } from '@/lib/auth/password'
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt'
import { supabaseServer } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validations/auth'
import { ensureDefaultAdminUser } from '@/lib/auth/admin-credentials'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = loginSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: result.error.issues[0]?.message || 'Invalid input' } },
        { status: 400 }
      )
    }

    const email = result.data.email.trim().toLowerCase()
    const password = result.data.password

    await ensureDefaultAdminUser()

    const { data: user, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } },
        { status: 401 }
      )
    }

    if (!user.is_active) {
      return NextResponse.json(
        { success: false, error: { code: 'ACCOUNT_INACTIVE', message: 'Account is inactive' } },
        { status: 403 }
      )
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const minutes = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000)
      return NextResponse.json(
        { success: false, error: { code: 'ACCOUNT_LOCKED', message: `Account locked. Try again in ${minutes} minutes` } },
        { status: 423 }
      )
    }

    const isValid = await comparePassword(password, user.password_hash)

    if (!isValid) {
      const failedAttempts = (user.failed_login_attempts || 0) + 1
      const updates: { failed_login_attempts: number; locked_until?: string } = {
        failed_login_attempts: failedAttempts,
      }

      if (failedAttempts >= 5) {
        const lockedUntil = new Date(Date.now() + 30 * 60 * 1000)
        updates.locked_until = lockedUntil.toISOString()
      }

      await supabaseServer.from('users').update(updates).eq('id', user.id)

      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } },
        { status: 401 }
      )
    }

    const accessToken = generateAccessToken(user.id, user.email, user.role)
    const refreshToken = generateRefreshToken(user.id, user.email, user.role)

    await supabaseServer
      .from('users')
      .update({
        last_login_at: new Date().toISOString(),
        failed_login_attempts: 0,
        locked_until: null,
      })
      .eq('id', user.id)

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.full_name,
          isVip: user.is_vip,
        },
        accessToken,
      },
    })

    response.cookies.set('access_token', accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    })

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
