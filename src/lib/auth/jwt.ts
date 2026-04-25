import jwt from 'jsonwebtoken'
import { env } from '@/config/env'
import type { UserRole } from '@/types/user'

export interface TokenPayload {
  userId: string
  username: string
  role: UserRole
  type: 'access' | 'refresh'
  iat: number
  exp: number
}

export function generateAccessToken(userId: string, username: string, role: UserRole): string {
  return jwt.sign(
    { userId, username, role, type: 'access' },
    env.JWT_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY as any }
  )
}

export function generateRefreshToken(userId: string, username: string, role: UserRole): string {
  return jwt.sign(
    { userId, username, role, type: 'refresh' },
    env.JWT_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRY as any }
  )
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload
  } catch {
    return null
  }
}
