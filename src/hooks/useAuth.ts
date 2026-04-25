'use client'

import { useState, useEffect } from 'react'
import type { User } from '@/types/user'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
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
            setUser(data.data)
            return
          }
        }

        setUser(null)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const login = async (username: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    const data = await res.json()
    if (data.success) {
      setUser(data.data.user)
    }
    return data
  }

  const signup = async (username: string, password: string, confirmPassword: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, confirmPassword }),
    })

    const data = await res.json()
    if (data.success) {
      setUser(data.data.user)
    }
    return data
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/login'
  }

  return { user, loading, login, signup, logout, isAdmin: user?.role === 'admin' || user?.role === 'super_admin' }
}
