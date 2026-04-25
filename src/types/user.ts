export type UserRole = 'super_admin' | 'admin' | 'viewer'

export interface User {
  id: string
  username: string
  email: string | null
  full_name: string | null
  role: UserRole
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
  username: string
  password: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
