'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { CustomerProfile } from '@/types/customer-profile'

interface AdminUserSummary {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'customer'
  is_vip: boolean
  is_active: boolean
  last_login_at: string | null
  created_at: string
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([])
  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [savingPhone, setSavingPhone] = useState<string | null>(null)
  const [savingUserId, setSavingUserId] = useState<string | null>(null)
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({})

  useEffect(() => {
    Promise.all([fetch('/api/customers').then((res) => res.json()), fetch('/api/admin/users').then((res) => res.json())])
      .then(([customerData, userData]) => {
        if (customerData.success) setCustomers(customerData.data)
        if (userData.success) setUsers(userData.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const updateCustomer = async (customer: CustomerProfile, patch: Partial<CustomerProfile>) => {
    setSavingPhone(customer.phone)
    try {
      const res = await fetch(`/api/customers/${encodeURIComponent(customer.phone)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const data = await res.json()
      if (data.success) {
        setCustomers((current) => current.map((item) => (item.phone === customer.phone ? data.data : item)))
        if (typeof patch.is_vip === 'boolean' && customer.user_id) {
          setUsers((current) => current.map((item) => (item.id === customer.user_id ? { ...item, is_vip: patch.is_vip! } : item)))
        }
      }
    } finally {
      setSavingPhone(null)
    }
  }

  const updateUser = async (user: AdminUserSummary, patch: Partial<AdminUserSummary>) => {
    setSavingUserId(user.id)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const data = await res.json()
      if (data.success) {
        setUsers((current) => current.map((item) => (item.id === user.id ? data.data : item)))
      }
    } finally {
      setSavingUserId(null)
    }
  }

  const resetPassword = async (user: AdminUserSummary) => {
    const password = passwordDrafts[user.id]?.trim()
    if (!password) return
    setSavingUserId(user.id)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (data.success) {
        setPasswordDrafts((current) => ({ ...current, [user.id]: '' }))
      } else {
        alert(data.error?.message || 'Failed to reset password')
      }
    } finally {
      setSavingUserId(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">العملاء والحسابات</h1>
        <p className="mt-1 text-sm text-muted-foreground">إدارة VIP، الحظر، الملاحظات، وتعويض غياب استرجاع كلمة المرور عبر إعادة تعيين يدوي من لوحة الإدارة.</p>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">حسابات المستخدمين</h2>
          <p className="mt-1 text-sm text-muted-foreground">تفعيل VIP، تعطيل الحساب، وإعادة ضبط كلمة المرور يدوياً.</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : (
          <div className="grid gap-4">
            {users.map((user) => (
              <div key={user.id} className="rounded-lg border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold">{user.full_name || 'بدون اسم'}</h2>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{user.role} • {user.is_active ? 'مفعل' : 'معطل'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user.role !== 'admin' ? (
                      <Button size="sm" variant={user.is_vip ? 'default' : 'outline'} disabled={savingUserId === user.id} onClick={() => updateUser(user, { is_vip: !user.is_vip })}>
                        {user.is_vip ? 'VIP مفعل' : 'تعيين VIP'}
                      </Button>
                    ) : null}
                    {user.role !== 'admin' ? (
                      <Button size="sm" variant={user.is_active ? 'outline' : 'destructive'} disabled={savingUserId === user.id} onClick={() => updateUser(user, { is_active: !user.is_active })}>
                        {user.is_active ? 'تعطيل الحساب' : 'إعادة التفعيل'}
                      </Button>
                    ) : null}
                  </div>
                </div>
                {user.role !== 'admin' ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                    <input
                      type="password"
                      value={passwordDrafts[user.id] || ''}
                      onChange={(e) => setPasswordDrafts((current) => ({ ...current, [user.id]: e.target.value }))}
                      className="min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="كلمة مرور جديدة مؤقتة"
                    />
                    <Button disabled={savingUserId === user.id} onClick={() => resetPassword(user)}>
                      إعادة تعيين كلمة المرور
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">ملفات العملاء والطلبات</h2>
          <p className="mt-1 text-sm text-muted-foreground">ملاحظات داخلية، قائمة سوداء، عملاء VIP، وإشارات الاحتيال على مستوى الطلبات.</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : (
          <div className="grid gap-4">
            {customers.map((customer) => (
              <div key={customer.id} className="rounded-lg border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold">{customer.full_name || 'عميل'}</h2>
                    <p className="text-sm text-muted-foreground">{customer.phone}</p>
                    {customer.email ? <p className="text-xs text-muted-foreground">{customer.email}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant={customer.is_vip ? 'default' : 'outline'} disabled={savingPhone === customer.phone} onClick={() => updateCustomer(customer, { is_vip: !customer.is_vip })}>
                      {customer.is_vip ? 'VIP' : 'تعيين VIP'}
                    </Button>
                    <Button size="sm" variant={customer.is_blacklisted ? 'destructive' : 'outline'} disabled={savingPhone === customer.phone} onClick={() => updateCustomer(customer, { is_blacklisted: !customer.is_blacklisted })}>
                      {customer.is_blacklisted ? 'إلغاء الحظر' : 'حظر'}
                    </Button>
                    <Button size="sm" variant="outline" disabled={savingPhone === customer.phone} onClick={() => updateCustomer(customer, { fraud_flags: customer.fraud_flags + 1 })}>
                      رفع علامة احتيال
                    </Button>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                  <textarea
                    value={customer.notes || ''}
                    onChange={(e) => setCustomers((current) => current.map((item) => (item.phone === customer.phone ? { ...item, notes: e.target.value } : item)))}
                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="ملاحظات داخلية عن العميل"
                  />
                  <Button disabled={savingPhone === customer.phone} onClick={() => updateCustomer(customer, { notes: customer.notes || '' })}>
                    حفظ الملاحظات
                  </Button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">إشارات الاحتيال: {customer.fraud_flags}</p>
              </div>
            ))}
            {customers.length === 0 && <div className="rounded-lg border bg-card px-6 py-10 text-center text-muted-foreground">لا توجد ملفات عملاء بعد.</div>}
          </div>
        )}
      </section>
    </div>
  )
}
