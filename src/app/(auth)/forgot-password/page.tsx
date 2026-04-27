'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUIStore } from '@/stores/ui-store'

export default function ForgotPasswordPage() {
  const locale = useUIStore((state) => state.locale)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const copy = locale === 'ar'
    ? {
        title: 'استرجاع كلمة المرور',
        body: 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.',
        email: 'البريد الإلكتروني',
        submit: 'إرسال رابط الاسترجاع',
        success: 'إذا كان البريد موجوداً، تم إرسال رابط إعادة التعيين.',
        back: 'العودة إلى الدخول',
      }
    : {
        title: 'Forgot password',
        body: 'Enter your email address and we will send you a password reset link.',
        email: 'Email address',
        submit: 'Send reset link',
        success: 'If the email exists, a reset link has been sent.',
        back: 'Back to sign in',
      }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Request failed')
      }
      setSubmitted(true)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-secondary to-primary/20 p-4">
      <Card className="w-full max-w-md shadow-heavy">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{copy.title}</CardTitle>
          <p className="text-sm leading-7 text-muted-foreground">{copy.body}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {submitted ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{copy.success}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error ? <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}
              <div className="space-y-2">
                <Label htmlFor="email">{copy.email}</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? '...' : copy.submit}</Button>
            </form>
          )}
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">{copy.back}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
