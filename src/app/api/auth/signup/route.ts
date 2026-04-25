import { NextRequest, NextResponse } from 'next/server'
import { hashPassword } from '@/lib/auth/password'
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt'
import { supabaseServer } from '@/lib/supabase/server'
import { signupSchema } from '@/lib/validations/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = signupSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: result.error.message } },
        { status: 400 }
      )
    }

    const username = result.data.username.trim()
    const passwordHash = await hashPassword(result.data.password)

    const { data: existingUser } = await supabaseServer
      .from('users')
      .select('id')
      .ilike('username', username)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { code: 'USERNAME_TAKEN', message: 'اسم المستخدم مستخدم بالفعل' } },
        { status: 409 }
      )
    }

    const { data: user, error } = await supabaseServer
      .from('users')
      .insert({
        username,
        password_hash: passwordHash,
        role: 'viewer',
        is_active: true,
        failed_login_attempts: 0,
        locked_until: null,
      })
      .select('*')
      .single()

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: error?.message || 'Failed to create account' } },
        { status: 500 }
      )
    }

    const accessToken = generateAccessToken(user.id, user.username, user.role)
    const refreshToken = generateRefreshToken(user.id, user.username, user.role)

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          fullName: user.full_name,
        },
        accessToken,
      },
    }, { status: 201 })

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
    console.error('Signup error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
