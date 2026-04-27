import jwt from 'jsonwebtoken'
import { env } from '@/config/env'

interface PasswordResetPayload {
  userId: string
  email: string
  type: 'password_reset'
  iat: number
  exp: number
}

export function generatePasswordResetToken(userId: string, email: string) {
  return jwt.sign(
    { userId, email, type: 'password_reset' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  )
}

export function verifyPasswordResetToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as PasswordResetPayload
}
