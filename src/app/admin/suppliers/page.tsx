'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { Supplier } from '@/types/supplier'

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', contact_name: '', phone: '', email: '', notes: '' })

  useEffect(() => {
    fetch('/api/suppliers')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSuppliers(data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const createSupplier = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setSuppliers((current) => [data.data, ...current])
        setForm({ name: '', contact_name: '', phone: '', email: '', notes: '' })
      }
    } finally {
      setSaving(false)
    }
  }

  const deleteSupplier = async (id: string) => {
    if (!confirm('حذف المورد؟')) return
    const res = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      setSuppliers((current) => current.filter((item) => item.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الموردون</h1>
        <p className="mt-1 text-sm text-muted-foreground">إدارة الموردين وربطهم بالمنتجات.</p>
      </div>

      <form onSubmit={createSupplier} className="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-2">
        <Input placeholder="اسم المورد" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input placeholder="اسم جهة الاتصال" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
        <Input placeholder="الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input placeholder="البريد الإلكتروني" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <textarea placeholder="ملاحظات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:col-span-2" />
        <Button type="submit" disabled={saving} className="md:w-fit">{saving ? 'جاري الحفظ...' : 'إضافة مورد'}</Button>
      </form>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : (
        <div className="grid gap-4">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="rounded-lg border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold">{supplier.name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{supplier.contact_name || '-'} • {supplier.phone || '-'} • {supplier.email || '-'}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{supplier.notes || 'بدون ملاحظات'}</p>
                </div>
                <Button size="sm" variant="destructive" onClick={() => deleteSupplier(supplier.id)}>حذف</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
