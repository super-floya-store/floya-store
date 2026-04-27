'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/stores/ui-store'

export default function AdminProfilePage() {
  const { user } = useAuth()
  const locale = useUIStore((state) => state.locale)
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const copy = locale === 'ar'
    ? {
        title: 'الملف الشخصي',
        userInfo: 'معلومات المستخدم',
        email: 'البريد',
        fullName: 'الاسم الكامل',
        vip: 'VIP',
        role: 'الدور',
        yes: 'نعم',
        no: 'لا',
        changePassword: 'تغيير كلمة المرور',
        currentPassword: 'كلمة المرور الحالية',
        newPassword: 'كلمة المرور الجديدة',
        confirmPassword: 'تأكيد كلمة المرور',
        saving: 'جاري الحفظ...',
        submit: 'تغيير كلمة المرور',
        mismatch: 'كلمات المرور غير متطابقة',
        success: 'تم تغيير كلمة المرور بنجاح',
        failed: 'فشل تغيير كلمة المرور',
        unexpected: 'حدث خطأ',
      }
    : {
        title: 'Profile',
        userInfo: 'User information',
        email: 'Email',
        fullName: 'Full name',
        vip: 'VIP',
        role: 'Role',
        yes: 'Yes',
        no: 'No',
        changePassword: 'Change password',
        currentPassword: 'Current password',
        newPassword: 'New password',
        confirmPassword: 'Confirm password',
        saving: 'Saving...',
        submit: 'Change password',
        mismatch: 'Passwords do not match',
        success: 'Password changed successfully',
        failed: 'Failed to change password',
        unexpected: 'Something went wrong',
      }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      alert(copy.mismatch)
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
        alert(copy.success)
        setPasswords({ current: '', new: '', confirm: '' })
      } else {
        alert(data.error?.message || copy.failed)
      }
    } catch {
      alert(copy.unexpected)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">{copy.title}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{copy.userInfo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><span className="font-medium">{copy.email}:</span> {user?.email}</p>
          <p><span className="font-medium">{copy.fullName}:</span> {user?.full_name || '-'}</p>
          <p><span className="font-medium">{copy.vip}:</span> {user?.is_vip ? copy.yes : copy.no}</p>
          <p><span className="font-medium">{copy.role}:</span> {user?.role}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.changePassword}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label>{copy.currentPassword}</Label>
              <Input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>{copy.newPassword}</Label>
              <Input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>{copy.confirmPassword}</Label>
              <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} required />
            </div>
            <Button type="submit" disabled={loading}>{loading ? copy.saving : copy.submit}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
