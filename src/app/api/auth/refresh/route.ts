import { NextRequest, NextResponse } from 'next/server'
import { generateAccessToken, generateRefreshToken, verifyToken } from '@/lib/auth/jwt'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = request.cookies
    const refreshToken = cookieStore.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No refresh token' } },
        { status: 401 }
      )
    }

    const payload = verifyToken(refreshToken)

    if (payload.type !== 'refresh') {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token type' } },
        { status: 401 }
      )
    }

    const { data: user, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', payload.userId)
      .single()

    if (error || !user || !user.is_active) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'User not found' } },
        { status: 401 }
      )
    }

    const accessToken = generateAccessToken(user.id, user.username, user.role)
    const newRefreshToken = generateRefreshToken(user.id, user.username, user.role)

    const response = NextResponse.json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          fullName: user.full_name,
        },
      },
    })

    response.cookies.set('access_token', accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    })

    response.cookies.set('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' } },
      { status: 401 }
    )
  }
}
