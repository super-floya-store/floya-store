import { cookies } from 'next/headers'
import { verifyToken } from './jwt'
import { supabaseServer } from '@/lib/supabase/server'
import type { User } from '@/types/user'

function getBearerToken(request?: Request) {
  return request?.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() || null
}

export async function getSession(request?: Request): Promise<{ user: User | null; token: string | null }> {
  try {
    const cookieStore = cookies()
    const token = getBearerToken(request) || cookieStore.get('access_token')?.value

    if (!token) {
      return { user: null, token: null }
    }

    const payload = verifyToken(token)

    const { data: user, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', payload.userId)
      .single()

    if (error || !user || !user.is_active) {
      return { user: null, token: null }
    }

    return { user, token }
  } catch {
    return { user: null, token: null }
  }
}

export async function requireAuth(request?: Request): Promise<{ user: User; token: string }> {
  const session = await getSession(request)

  if (!session.user || !session.token) {
    throw new Error('Unauthorized')
  }

  return { user: session.user, token: session.token }
}

export async function requireAdmin(request?: Request): Promise<{ user: User; token: string }> {
  const session = await requireAuth(request)

  if (session.user.role !== 'admin') {
    throw new Error('Forbidden')
  }

  return session
}
