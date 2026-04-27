'use client'

import { useState, useEffect } from 'react'
import type { User } from '@/types/user'

let cachedUser: User | null | undefined
let authRequest: Promise<User | null> | null = null

function normalizeUser(payload: any): User {
  return {
    ...payload,
    full_name: payload.full_name ?? payload.fullName ?? null,
    is_vip: payload.is_vip ?? payload.isVip ?? false,
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(cachedUser ?? null)
  const [loading, setLoading] = useState(cachedUser === undefined)

  useEffect(() => {
    async function fetchUser() {
      if (cachedUser !== undefined) {
        setUser(cachedUser)
        setLoading(false)
        return
      }

      try {
        authRequest ??= (async () => {
          let res = await fetch('/api/auth/me')

          if (res.status === 401) {
            const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' })
            if (refreshRes.ok) {
              res = await fetch('/api/auth/me')
            }
          }

          if (res.ok) {
            const data = await res.json()
            if (data.success) {
              return normalizeUser(data.data)
            }
          }

          return null
        })()

        const nextUser = await authRequest
        cachedUser = nextUser
        setUser(nextUser)
      } catch {
        cachedUser = null
        setUser(null)
      } finally {
        authRequest = null
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    if (data.success) {
      const nextUser = normalizeUser(data.data.user)
      cachedUser = nextUser
      setUser(nextUser)
    }
    return data
  }

  const signup = async (fullName: string, email: string, password: string, confirmPassword: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password, confirmPassword }),
    })

    const data = await res.json()
    if (data.success) {
      const nextUser = normalizeUser(data.data.user)
      cachedUser = nextUser
      setUser(nextUser)
    }
    return data
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    cachedUser = null
    setUser(null)
    window.location.href = '/login'
  }

  return { user, loading, login, signup, logout, isAdmin: user?.role === 'admin' }
}
