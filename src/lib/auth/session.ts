import { cookies } from 'next/headers'
import { verifyToken } from './jwt'
import { supabaseServer } from '@/lib/supabase/server'
import type { User } from '@/types/user'

export async function getSession(): Promise<{ user: User | null; token: string | null }> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('access_token')?.value

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

export async function requireAuth(): Promise<{ user: User; token: string }> {
  const session = await getSession()

  if (!session.user || !session.token) {
    throw new Error('Unauthorized')
  }

  return { user: session.user, token: session.token }
}

export async function requireAdmin(): Promise<{ user: User; token: string }> {
  const session = await requireAuth()

  if (!['admin', 'super_admin'].includes(session.user.role)) {
    throw new Error('Forbidden')
  }

  return session
}
