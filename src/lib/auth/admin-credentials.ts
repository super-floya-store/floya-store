import { hashPassword } from './password'
import { supabaseServer } from '@/lib/supabase/server'

export const DEFAULT_ADMIN_EMAIL = 'elwehch123@gmail.com'
export const DEFAULT_ADMIN_PASSWORD = 'ADMINSTORE2@26!'

export async function ensureDefaultAdminUser() {
  const normalizedEmail = DEFAULT_ADMIN_EMAIL.toLowerCase()
  const { data: existing } = await supabaseServer
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (existing) {
    return existing
  }

  const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD)
  const { data } = await supabaseServer
    .from('users')
    .insert({
      email: normalizedEmail,
      full_name: 'Store Admin',
      password_hash: passwordHash,
      role: 'admin',
      is_vip: false,
      is_active: true,
      failed_login_attempts: 0,
      locked_until: null,
    })
    .select('id')
    .single()

  return data
}
