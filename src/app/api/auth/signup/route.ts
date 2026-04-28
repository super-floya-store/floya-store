import { NextRequest, NextResponse } from 'next/server'
import { hashPassword } from '@/lib/auth/password'
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt'
import { supabaseServer } from '@/lib/supabase/server'
import { signupSchema } from '@/lib/validations/auth'
import { DEFAULT_ADMIN_EMAIL, ensureDefaultAdminUser } from '@/lib/auth/admin-credentials'

export async function POST(request: NextRequest) {
  try {
    await ensureDefaultAdminUser()
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DISABLED',
          message: 'Customer accounts are disabled. Only the store admin can sign in.',
        },
      },
      { status: 403 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
