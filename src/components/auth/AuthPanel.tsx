'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUIStore } from '@/stores/ui-store'

type Mode = 'login' | 'signup'

interface AuthPanelProps {
  initialMode: Mode
}

export function AuthPanel({ initialMode }: AuthPanelProps) {
  const router = useRouter()
  const locale = useUIStore((state) => state.locale)
  const [mode, setMode] = useState<Mode>(initialMode)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, signup } = useAuth()

  const copy = locale === 'ar'
    ? {
        loginTitle: 'دخول الحساب',
        signupTitle: 'إنشاء حساب',
        subtitle: 'ادخل بحسابك أو أنشئ حساباً جديداً لإتمام الطلبات ومتابعة حالتها بسهولة.',
        username: 'اسم المستخدم',
        password: 'كلمة المرور',
        confirmPassword: 'تأكيد كلمة المرور',
        loginButton: 'دخول الحساب',
        signupButton: 'إنشاء الحساب',
        switchToLogin: 'عندي حساب بالفعل',
        switchToSignup: 'أريد إنشاء حساب',
        homeLink: 'العودة إلى المتجر',
        loadingLogin: 'جارٍ تسجيل الدخول...',
        loadingSignup: 'جارٍ إنشاء الحساب...',
        loginError: 'فشل تسجيل الدخول',
        signupError: 'تعذر إنشاء الحساب',
      }
    : {
        loginTitle: 'Sign in',
        signupTitle: 'Create account',
        subtitle: 'Sign in or create a new account to follow orders easily.',
        username: 'Username',
        password: 'Password',
        confirmPassword: 'Confirm password',
        loginButton: 'Sign in',
        signupButton: 'Create account',
        switchToLogin: 'I already have an account',
        switchToSignup: 'Create a new account',
        homeLink: 'Back to store',
      }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = mode === 'login'
      ? await login(username, password)
      : await signup(username, password, confirmPassword)

    if (result.success) {
      router.replace('/')
    } else {
      setError(result.error?.message || (mode === 'login' ? copy.loginError : copy.signupError))
    }

    setLoading(false)
  }

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
          <CardTitle className="text-2xl">{mode === 'login' ? copy.loginTitle : copy.signupTitle}</CardTitle>
          <CardDescription>{copy.subtitle}</CardDescription>
          <div className="mt-4 flex rounded-full bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'login' ? 'bg-white text-secondary shadow-soft' : 'text-muted-foreground'}`}
            >
              {copy.loginTitle}
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'signup' ? 'bg-white text-secondary shadow-soft' : 'text-muted-foreground'}`}
            >
              {copy.signupTitle}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="username">{copy.username}</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
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
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'إخفاء' : 'إظهار'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{copy.confirmPassword}</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (mode === 'login' ? copy.loadingLogin : copy.loadingSignup) : mode === 'login' ? copy.loginButton : copy.signupButton}
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            >
              {mode === 'login' ? copy.switchToSignup : copy.switchToLogin}
            </button>
            <Link href="/" className="text-muted-foreground hover:text-foreground hover:underline">
              {copy.homeLink}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
