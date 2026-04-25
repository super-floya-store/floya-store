'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { CustomerProfile } from '@/types/customer-profile'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [savingPhone, setSavingPhone] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/customers')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCustomers(data.data)
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
      }
    } finally {
      setSavingPhone(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">العملاء</h1>
        <p className="mt-1 text-sm text-muted-foreground">ملاحظات داخلية، قائمة سوداء، عملاء VIP، وإشارات الاحتيال.</p>
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
    </div>
  )
}
