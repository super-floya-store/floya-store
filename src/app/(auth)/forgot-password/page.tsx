'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'

export default function ForgotPasswordPage() {
  const locale = useUIStore((state) => state.locale)
  const copy = locale === 'ar'
    ? {
        title: 'استرجاع كلمة المرور',
        body: 'حالياً لا يوجد استرجاع تلقائي لكلمة المرور. إذا فقدت الوصول إلى حسابك تواصل مع دعم المتجر ليتم إعادة التعيين يدوياً من لوحة الإدارة.',
        contact: 'التواصل مع الدعم',
        back: 'العودة إلى الدخول',
      }
    : {
        title: 'Password recovery',
        body: 'Automatic password recovery is not available yet. If you lose access, contact store support so an admin can reset your password manually.',
        contact: 'Contact support',
        back: 'Back to sign in',
      }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-secondary to-primary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{copy.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm leading-7 text-muted-foreground">{copy.body}</p>
          <Button asChild className="w-full">
            <Link href="/contact">{copy.contact}</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">{copy.back}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
