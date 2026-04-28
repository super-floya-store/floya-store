'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUIStore } from '@/stores/ui-store'

interface AuthPanelProps {
  initialMode: 'login'
}

export function AuthPanel({ initialMode }: AuthPanelProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useUIStore((state) => state.locale)
  const [mode] = useState<'login'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const copy = locale === 'ar'
      ? {
        loginTitle: 'دخول الإدارة',
        subtitle: 'تسجيل الدخول مخصص للإدارة فقط. العملاء يمكنهم الطلب والمتابعة بدون حساب.',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        loginButton: 'دخول الإدارة',
        forgotPassword: 'نسيت كلمة المرور؟',
        homeLink: 'العودة إلى المتجر',
        loadingLogin: 'جارٍ تسجيل الدخول...',
        loginError: 'فشل تسجيل الدخول',
        resetInfo: 'يمكنك استخدام رابط "نسيت كلمة المرور؟" لإعادة تعيين كلمة مرور الإدارة عبر البريد الإلكتروني.',
      }
    : {
        loginTitle: 'Admin sign in',
        subtitle: 'Login is reserved for the store admin only. Customers can order and track purchases without an account.',
        email: 'Email',
        password: 'Password',
        loginButton: 'Admin sign in',
        forgotPassword: 'Forgot password?',
        homeLink: 'Back to store',
        loadingLogin: 'Signing in...',
        loginError: 'Sign-in failed',
        resetInfo: 'Use the "Forgot password?" link to reset the admin password by email.',
      }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const next = searchParams.get('next')
    const result = await login(email, password)

    if (result.success) {
      const destination = next || '/admin'
      router.replace(destination)
    } else {
      setError(result.error?.message || copy.loginError)
    }

    setLoading(false)
  }

  const eyeClass = locale === 'ar'
    ? 'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
    : 'absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-secondary to-primary/20 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-heavy">
        <CardHeader className="text-center">
          <div className="mb-2 flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                const nextLocale = locale === 'ar' ? 'en' : 'ar'
                // Reuse the global locale state so the auth screen follows the storefront language.
                useUIStore.setState({ locale: nextLocale })
              }}
              className="surface-card premium-outline inline-flex min-h-[44px] items-center justify-center rounded-full px-4 text-xs font-bold tracking-[0.2em] text-secondary transition duration-300 hover:-translate-y-0.5 hover:text-primary hover:shadow-soft"
              aria-label={locale === 'ar' ? 'English' : 'العربية'}
            >
              {locale === 'ar' ? 'EN' : 'AR'}
            </button>
          </div>
          <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">{copy.loginTitle}</CardTitle>
          <CardDescription>{copy.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="email">{copy.email}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{copy.password}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={eyeClass}
                  aria-label={showPassword ? (locale === 'ar' ? 'إخفاء كلمة المرور' : 'Hide password') : (locale === 'ar' ? 'إظهار كلمة المرور' : 'Show password')}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? copy.loadingLogin : copy.loginButton}
            </Button>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900">
              {copy.resetInfo}
            </div>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <Link href="/forgot-password" className="text-primary hover:underline">
                {copy.forgotPassword}
              </Link>
              <Link href="/" className="text-muted-foreground hover:text-foreground hover:underline">
                {copy.homeLink}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
