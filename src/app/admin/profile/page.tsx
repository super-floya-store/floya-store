'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

export default function AdminProfilePage() {
  const { user } = useAuth()
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      alert('كلمات المرور غير متطابقة')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
          confirmPassword: passwords.confirm,
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert('تم تغيير كلمة المرور بنجاح')
        setPasswords({ current: '', new: '', confirm: '' })
      } else {
        alert(data.error?.message || 'فشل تغيير كلمة المرور')
      }
    } catch {
      alert('حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">الملف الشخصي</h1>

      <Card>
        <CardHeader>
          <CardTitle>معلومات المستخدم</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><span className="font-medium">اسم المستخدم:</span> {user?.username}</p>
          <p><span className="font-medium">الاسم الكامل:</span> {user?.full_name || '-'}</p>
          <p><span className="font-medium">البريد:</span> {user?.email || '-'}</p>
          <p><span className="font-medium">الدور:</span> {user?.role}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>تغيير كلمة المرور</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label>كلمة المرور الحالية</Label>
              <Input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>كلمة المرور الجديدة</Label>
              <Input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>تأكيد كلمة المرور</Label>
              <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} required />
            </div>
            <Button type="submit" disabled={loading}>{loading ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
