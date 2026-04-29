'use client'

import { useState } from 'react'
import { Lock, Shield, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/stores/ui-store'
import { AdminPageHeader, AdminPanel, AdminStatCard } from '@/components/admin/AdminShell'

export default function AdminProfilePage() {
  const { user } = useAuth()
  const locale = useUIStore((state) => state.locale)
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const copy = locale === 'ar'
    ? {
        eyebrow: 'الحساب الإداري',
        title: 'الملف الشخصي',
        description: 'مراجعة بيانات حساب الإدارة وتحديث كلمة المرور من صفحة واحدة.',
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
        eyebrow: 'Admin account',
        title: 'Profile',
        description: 'Review the active admin account and update the password from one page.',
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
    setError('')
    setMessage('')
    if (passwords.new !== passwords.confirm) {
      setError(copy.mismatch)
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
        setMessage(copy.success)
        setPasswords({ current: '', new: '', confirm: '' })
      } else {
        setError(data.error?.message || copy.failed)
      }
    } catch {
      setError(copy.unexpected)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <AdminPageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label={copy.email} value={user?.email || '-'} icon={UserRound} />
        <AdminStatCard label={copy.fullName} value={user?.full_name || '-'} icon={UserRound} />
        <AdminStatCard label={copy.role} value={user?.role || '-'} icon={Shield} />
        <AdminStatCard label={copy.vip} value={user?.is_vip ? copy.yes : copy.no} icon={Shield} />
      </div>

      <AdminPanel title={copy.userInfo}>
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <p><span className="font-medium">{copy.email}:</span> {user?.email}</p>
          <p><span className="font-medium">{copy.fullName}:</span> {user?.full_name || '-'}</p>
          <p><span className="font-medium">{copy.vip}:</span> {user?.is_vip ? copy.yes : copy.no}</p>
          <p><span className="font-medium">{copy.role}:</span> {user?.role}</p>
        </div>
      </AdminPanel>

      <AdminPanel title={copy.changePassword}>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
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
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" disabled={loading}>
              <Lock className="h-4 w-4" />
              {loading ? copy.saving : copy.submit}
            </Button>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? <p className="text-sm text-green-600">{message}</p> : null}
          </div>
        </form>
      </AdminPanel>
    </div>
  )
}
