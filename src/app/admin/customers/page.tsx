'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, ShieldAlert, Sparkles, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminEmptyState, AdminPageHeader, AdminPanel, AdminStatCard, AdminToolbar } from '@/components/admin/AdminShell'
import type { CustomerProfile } from '@/types/customer-profile'
import { useUIStore } from '@/stores/ui-store'
import { formatNumber } from '@/lib/utils/format'

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
  const locale = useUIStore((state) => state.locale)
  const [customers, setCustomers] = useState<CustomerProfile[]>([])
  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [savingPhone, setSavingPhone] = useState<string | null>(null)
  const [savingUserId, setSavingUserId] = useState<string | null>(null)
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({})
  const [query, setQuery] = useState('')
  const copy = locale === 'ar'
    ? {
        eyebrow: 'إدارة العملاء',
        title: 'العملاء والحسابات',
        description: 'إدارة VIP والحظر والملاحظات الداخلية وإعادة تعيين كلمات المرور من واجهة واحدة.',
        usersTitle: 'حسابات المستخدمين',
        usersSubtitle: 'تفعيل VIP، تعطيل الحساب، وإعادة ضبط كلمة المرور يدوياً.',
        customersTitle: 'ملفات العملاء والطلبات',
        customersSubtitle: 'ملاحظات داخلية، قائمة سوداء، عملاء VIP، وإشارات الاحتيال على مستوى الطلبات.',
        unnamed: 'بدون اسم',
        userEnabled: 'مفعل',
        userDisabled: 'معطل',
        enableVip: 'تعيين VIP',
        vipEnabled: 'VIP مفعل',
        disableAccount: 'تعطيل الحساب',
        reactivateAccount: 'إعادة التفعيل',
        tempPassword: 'كلمة مرور جديدة مؤقتة',
        resetPassword: 'إعادة تعيين كلمة المرور',
        resetPasswordFailed: 'فشل إعادة تعيين كلمة المرور',
        customerFallback: 'عميل',
        blacklist: 'حظر',
        unblacklist: 'إلغاء الحظر',
        raiseFraudFlag: 'رفع علامة احتيال',
        notesPlaceholder: 'ملاحظات داخلية عن العميل',
        saveNotes: 'حفظ الملاحظات',
        fraudFlags: 'إشارات الاحتيال',
        noCustomers: 'لا توجد ملفات عملاء بعد.',
        noUsers: 'لا توجد حسابات عملاء قابلة للإدارة بعد.',
        search: 'ابحث بالاسم أو البريد أو الهاتف',
        usersCount: 'الحسابات',
        vipCount: 'عملاء VIP',
        blacklistedCount: 'محظورون',
        disabledCount: 'حسابات معطلة',
      }
    : {
        eyebrow: 'Customer operations',
        title: 'Customers and accounts',
        description: 'Manage VIP status, suspensions, internal notes, and manual password resets from one surface.',
        usersTitle: 'User accounts',
        usersSubtitle: 'Enable VIP, suspend accounts, and reset passwords manually.',
        customersTitle: 'Customer profiles and orders',
        customersSubtitle: 'Internal notes, blacklist flags, VIP customers, and fraud signals at the order level.',
        unnamed: 'No name',
        userEnabled: 'Active',
        userDisabled: 'Disabled',
        enableVip: 'Set VIP',
        vipEnabled: 'VIP enabled',
        disableAccount: 'Disable account',
        reactivateAccount: 'Reactivate',
        tempPassword: 'Temporary new password',
        resetPassword: 'Reset password',
        resetPasswordFailed: 'Failed to reset password',
        customerFallback: 'Customer',
        blacklist: 'Blacklist',
        unblacklist: 'Remove blacklist',
        raiseFraudFlag: 'Raise fraud flag',
        notesPlaceholder: 'Internal notes about this customer',
        saveNotes: 'Save notes',
        fraudFlags: 'Fraud flags',
        noCustomers: 'No customer profiles yet.',
        noUsers: 'No manageable customer accounts yet.',
        search: 'Search by name, email, or phone',
        usersCount: 'Accounts',
        vipCount: 'VIP customers',
        blacklistedCount: 'Blacklisted',
        disabledCount: 'Disabled accounts',
      }

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
        alert(data.error?.message || copy.resetPasswordFailed)
      }
    } finally {
      setSavingUserId(null)
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => [user.full_name || '', user.email || ''].some((value) => value.toLowerCase().includes(query.toLowerCase())))
  }, [users, query])

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => [customer.full_name || '', customer.email || '', customer.phone || ''].some((value) => value.toLowerCase().includes(query.toLowerCase())))
  }, [customers, query])

  const vipCount = customers.filter((customer) => customer.is_vip).length
  const blacklistedCount = customers.filter((customer) => customer.is_blacklisted).length
  const disabledCount = users.filter((user) => !user.is_active).length

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label={copy.usersCount} value={formatNumber(users.length, locale)} icon={UserCog} />
        <AdminStatCard label={copy.vipCount} value={formatNumber(vipCount, locale)} icon={Sparkles} tone="success" />
        <AdminStatCard label={copy.blacklistedCount} value={formatNumber(blacklistedCount, locale)} icon={ShieldAlert} tone="danger" />
        <AdminStatCard label={copy.disabledCount} value={formatNumber(disabledCount, locale)} icon={UserCog} tone="warning" />
      </div>

      <AdminToolbar>
        <label className="relative min-w-[260px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.search}
            className="h-11 w-full rounded-full border border-border bg-white pl-10 pr-4 text-sm text-foreground shadow-soft outline-none"
          />
        </label>
      </AdminToolbar>

      <section className="space-y-4">
        <AdminPanel title={copy.usersTitle} description={copy.usersSubtitle}>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 rounded-[24px]" />
              <Skeleton className="h-24 rounded-[24px]" />
            </div>
          ) : filteredUsers.length ? (
            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="rounded-[24px] border border-border/70 bg-white/70 p-5 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-foreground">{user.full_name || copy.unnamed}</h2>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{user.role} • {user.is_active ? copy.userEnabled : copy.userDisabled}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {user.role !== 'admin' ? (
                        <Button size="sm" variant={user.is_vip ? 'default' : 'outline'} disabled={savingUserId === user.id} onClick={() => updateUser(user, { is_vip: !user.is_vip })}>
                          {user.is_vip ? copy.vipEnabled : copy.enableVip}
                        </Button>
                      ) : null}
                      {user.role !== 'admin' ? (
                        <Button size="sm" variant={user.is_active ? 'outline' : 'destructive'} disabled={savingUserId === user.id} onClick={() => updateUser(user, { is_active: !user.is_active })}>
                          {user.is_active ? copy.disableAccount : copy.reactivateAccount}
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
                        className="min-h-[44px] rounded-full border border-border bg-white px-4 py-2 text-sm text-foreground shadow-soft"
                        placeholder={copy.tempPassword}
                      />
                      <Button disabled={savingUserId === user.id} onClick={() => resetPassword(user)}>
                        {copy.resetPassword}
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <AdminEmptyState title={copy.noUsers} />
          )}
        </AdminPanel>
      </section>

      <section className="space-y-4">
        <AdminPanel title={copy.customersTitle} description={copy.customersSubtitle}>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 rounded-[24px]" />
              <Skeleton className="h-24 rounded-[24px]" />
            </div>
          ) : filteredCustomers.length ? (
            <div className="grid gap-4">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="rounded-[24px] border border-border/70 bg-white/70 p-5 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-foreground">{customer.full_name || copy.customerFallback}</h2>
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                      {customer.email ? <p className="text-xs text-muted-foreground">{customer.email}</p> : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant={customer.is_vip ? 'default' : 'outline'} disabled={savingPhone === customer.phone} onClick={() => updateCustomer(customer, { is_vip: !customer.is_vip })}>
                        {customer.is_vip ? 'VIP' : copy.enableVip}
                      </Button>
                      <Button size="sm" variant={customer.is_blacklisted ? 'destructive' : 'outline'} disabled={savingPhone === customer.phone} onClick={() => updateCustomer(customer, { is_blacklisted: !customer.is_blacklisted })}>
                        {customer.is_blacklisted ? copy.unblacklist : copy.blacklist}
                      </Button>
                      <Button size="sm" variant="outline" disabled={savingPhone === customer.phone} onClick={() => updateCustomer(customer, { fraud_flags: customer.fraud_flags + 1 })}>
                        {copy.raiseFraudFlag}
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                    <textarea
                      value={customer.notes || ''}
                      onChange={(e) => setCustomers((current) => current.map((item) => (item.phone === customer.phone ? { ...item, notes: e.target.value } : item)))}
                      className="min-h-[100px] w-full rounded-[20px] border border-border bg-white px-4 py-3 text-sm text-foreground shadow-soft"
                      placeholder={copy.notesPlaceholder}
                    />
                    <Button disabled={savingPhone === customer.phone} onClick={() => updateCustomer(customer, { notes: customer.notes || '' })}>
                      {copy.saveNotes}
                    </Button>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">{copy.fraudFlags}: {formatNumber(customer.fraud_flags, locale)}</p>
                </div>
              ))}
            </div>
          ) : (
            <AdminEmptyState title={copy.noCustomers} />
          )}
        </AdminPanel>
      </section>
    </div>
  )
}
