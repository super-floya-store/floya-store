'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUIStore } from '@/stores/ui-store'

export default function ResetPasswordPage() {
  const locale = useUIStore((state) => state.locale)
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const copy = locale === 'ar'
    ? {
        title: 'إعادة تعيين كلمة المرور',
        password: 'كلمة المرور الجديدة',
        confirmPassword: 'تأكيد كلمة المرور',
        submit: 'حفظ كلمة المرور',
        back: 'العودة إلى الدخول',
        successRoute: '/login',
      }
    : {
        title: 'Reset password',
        password: 'New password',
        confirmPassword: 'Confirm password',
        submit: 'Save password',
        back: 'Back to sign in',
        successRoute: '/login',
      }

  const eyeClass = locale === 'ar'
    ? 'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
    : 'absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Reset failed')
      }
      router.replace(copy.successRoute)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-secondary to-primary/20 p-4">
      <Card className="w-full max-w-md shadow-heavy">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{copy.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}
            <div className="space-y-2">
              <Label htmlFor="password">{copy.password}</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className={eyeClass} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{copy.confirmPassword}</Label>
              <Input id="confirm-password" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? '...' : copy.submit}</Button>
          </form>
          <Button asChild variant="outline" className="mt-4 w-full">
            <Link href="/login">{copy.back}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
