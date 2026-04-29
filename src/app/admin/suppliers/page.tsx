'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useUIStore } from '@/stores/ui-store'
import { formatNumber } from '@/lib/utils/format'
import { AdminEmptyState, AdminPageHeader, AdminPanel, AdminStatCard, AdminToolbar } from '@/components/admin/AdminShell'
import type { Supplier } from '@/types/supplier'

export default function AdminSuppliersPage() {
  const locale = useUIStore((state) => state.locale)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState('')
  const [form, setForm] = useState({ name: '', contact_name: '', phone: '', email: '', notes: '' })
  const copy = locale === 'ar'
    ? {
        eyebrow: 'إدارة الموردين',
        title: 'الموردون',
        subtitle: 'تنظيم الموردين وربط بياناتهم التشغيلية مع الكتالوج والمخزون.',
        search: 'ابحث باسم المورد أو جهة الاتصال أو البريد',
        supplierName: 'اسم المورد',
        contactName: 'اسم جهة الاتصال',
        phone: 'الهاتف',
        email: 'البريد الإلكتروني',
        notes: 'ملاحظات',
        noNotes: 'بدون ملاحظات',
        add: 'إضافة مورد',
        saving: 'جاري الحفظ...',
        delete: 'حذف',
        deleteConfirm: 'حذف المورد؟',
        empty: 'لا يوجد موردون حالياً.',
        emptyDescription: 'أضف مورداً جديداً ليظهر هنا ويمكن ربطه بالمنتجات.',
        suppliersCount: 'عدد الموردين',
      }
    : {
        eyebrow: 'Supplier management',
        title: 'Suppliers',
        subtitle: 'Organize suppliers and keep their operational details tied to the catalog and inventory work.',
        search: 'Search by supplier, contact, or email',
        supplierName: 'Supplier name',
        contactName: 'Contact name',
        phone: 'Phone',
        email: 'Email',
        notes: 'Notes',
        noNotes: 'No notes',
        add: 'Add supplier',
        saving: 'Saving...',
        delete: 'Delete',
        deleteConfirm: 'Delete supplier?',
        empty: 'There are no suppliers yet.',
        emptyDescription: 'Add a supplier and it will appear here for product linking.',
        suppliersCount: 'Suppliers',
      }

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
    if (!confirm(copy.deleteConfirm)) return
    const res = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      setSuppliers((current) => current.filter((item) => item.id !== id))
    }
  }

  const filteredSuppliers = useMemo(() => {
    const normalized = query.toLowerCase().trim()
    if (!normalized) return suppliers
    return suppliers.filter((supplier) =>
      [supplier.name, supplier.contact_name || '', supplier.email || '']
        .some((value) => value.toLowerCase().includes(normalized))
    )
  }, [suppliers, query])

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.subtitle} />

      <AdminStatCard label={copy.suppliersCount} value={formatNumber(suppliers.length, locale)} icon={Truck} />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.2fr]">
        <AdminPanel title={copy.add}>
          <form onSubmit={createSupplier} className="grid gap-4 md:grid-cols-2">
            <Input placeholder={copy.supplierName} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder={copy.contactName} value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
            <Input placeholder={copy.phone} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder={copy.email} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <textarea placeholder={copy.notes} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="min-h-[110px] w-full rounded-[20px] border border-input bg-background px-4 py-3 text-sm md:col-span-2" />
            <Button type="submit" disabled={saving} className="md:w-fit">{saving ? copy.saving : copy.add}</Button>
          </form>
        </AdminPanel>

        <div className="space-y-4">
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
            <div className="text-sm text-muted-foreground">
              {formatNumber(filteredSuppliers.length, locale)} / {formatNumber(suppliers.length, locale)}
            </div>
          </AdminToolbar>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 rounded-[24px]" />
              <Skeleton className="h-20 rounded-[24px]" />
            </div>
          ) : filteredSuppliers.length ? (
            <div className="grid gap-4">
              {filteredSuppliers.map((supplier) => (
                <AdminPanel key={supplier.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">{supplier.name}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">{supplier.contact_name || '-'} • {supplier.phone || '-'} • {supplier.email || '-'}</p>
                      <p className="mt-3 text-sm text-muted-foreground">{supplier.notes || copy.noNotes}</p>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => deleteSupplier(supplier.id)}>{copy.delete}</Button>
                  </div>
                </AdminPanel>
              ))}
            </div>
          ) : (
            <AdminEmptyState title={copy.empty} description={copy.emptyDescription} />
          )}
        </div>
      </div>
    </div>
  )
}
