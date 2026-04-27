export type UserRole = 'admin' | 'customer'

export interface User {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  is_vip: boolean
  is_active: boolean
  last_login_at: string | null
  password_changed_at: string | null
  failed_login_attempts: number
  locked_until: string | null
  created_at: string
  updated_at: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
