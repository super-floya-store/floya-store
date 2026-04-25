'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Product } from '@/types/product'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkValue, setBulkValue] = useState('')
  const [csvText, setCsvText] = useState('')

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products?limit=100&includeUnpublished=true')
        const data = await res.json()
        if (data.success) {
          setProducts(data.data)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const allSelected = products.length > 0 && selectedIds.length === products.length

  const toggleSelected = (productId: string) => {
    setSelectedIds((current) => current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId])
  }

  const runBulkAction = async (action: string, value?: number) => {
    if (selectedIds.length === 0) return
    const res = await fetch('/api/products/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds, action, value }),
    })
    const data = await res.json()
    if (!data.success) {
      alert(data.error?.message || 'تعذر تنفيذ العملية الجماعية')
      return
    }

    const refreshed = await fetch('/api/products?limit=100&includeUnpublished=true').then((response) => response.json())
    if (refreshed.success) setProducts(refreshed.data)
    setSelectedIds([])
  }

  const exportCsv = async () => {
    const response = await fetch('/api/products/export')
    const csv = await response.text()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'products-export.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const importCsv = async () => {
    if (!csvText.trim()) return
    const res = await fetch('/api/products/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv: csvText }),
    })
    const data = await res.json()
    if (data.success) {
      setCsvText('')
      const refreshed = await fetch('/api/products?limit=100&includeUnpublished=true').then((response) => response.json())
      if (refreshed.success) setProducts(refreshed.data)
      alert(`تمت إضافة ${data.data.insertedCount} منتج`)
    } else {
      alert(data.error?.message || 'تعذر استيراد CSV')
    }
  }

  const togglePublish = async (product: Product) => {
    setSavingId(product.id)
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !product.is_published }),
      })
      const data = await res.json()
      if (data.success) {
        setProducts((current) => current.map((item) => (item.id === product.id ? { ...item, ...data.data } : item)))
      } else {
        alert(data.error?.message || 'تعذر تحديث حالة المنتج')
      }
    } finally {
      setSavingId(null)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('هل تريد حذف المنتج أو إخفاءه؟')) return
    setSavingId(productId)
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setProducts((current) => current.filter((item) => item.id !== productId))
      } else {
        alert(data.error?.message || 'تعذر حذف المنتج')
      }
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">المنتجات</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportCsv}>تصدير CSV</Button>
          <Button asChild>
            <Link href="/admin/products/new">إضافة منتج</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={selectedIds.length === 0} onClick={() => runBulkAction('publish')}>نشر المحدد</Button>
          <Button size="sm" variant="outline" disabled={selectedIds.length === 0} onClick={() => runBulkAction('unpublish')}>إخفاء المحدد</Button>
          <Button size="sm" variant="outline" disabled={selectedIds.length === 0} onClick={() => runBulkAction('set_stock', Number(bulkValue || 0))}>تعيين المخزون</Button>
          <Button size="sm" variant="outline" disabled={selectedIds.length === 0} onClick={() => runBulkAction('adjust_stock', Number(bulkValue || 0))}>تعديل المخزون</Button>
          <Button size="sm" variant="outline" disabled={selectedIds.length === 0} onClick={() => runBulkAction('set_price', Number(bulkValue || 0))}>تعيين السعر</Button>
          <Button size="sm" variant="outline" disabled={selectedIds.length === 0} onClick={() => runBulkAction('adjust_price_percent', Number(bulkValue || 0))}>تعديل % السعر</Button>
          <input value={bulkValue} onChange={(e) => setBulkValue(e.target.value)} type="number" placeholder="القيمة" className="h-9 rounded-md border border-input bg-background px-3 text-sm" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">استيراد CSV</p>
          <textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} placeholder="الصق محتوى CSV هنا" className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <Button size="sm" onClick={importCsv}>استيراد</Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-right font-medium">
                  <input type="checkbox" checked={allSelected} onChange={() => setSelectedIds(allSelected ? [] : products.map((product) => product.id))} />
                </th>
                <th className="px-4 py-3 text-right font-medium">الصورة</th>
                <th className="px-4 py-3 text-right font-medium">الاسم</th>
                <th className="px-4 py-3 text-right font-medium">السعر</th>
                <th className="px-4 py-3 text-right font-medium">المخزون</th>
                <th className="px-4 py-3 text-right font-medium">تنبيه</th>
                <th className="px-4 py-3 text-right font-medium">الحالة</th>
                <th className="px-4 py-3 text-right font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelected(product.id)} />
                  </td>
                  <td className="px-4 py-3">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt="" className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{product.name_ar}</td>
                  <td className="px-4 py-3">{product.price.toLocaleString()} د.ج</td>
                  <td className="px-4 py-3">{product.stock_quantity}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${(product.low_stock_threshold || 3) >= product.stock_quantity && product.stock_quantity > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                      {product.low_stock_threshold || 3}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        product.is_published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.is_published ? 'منشور' : 'مسودة'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/admin/products/${product.id}/edit`}>تعديل</Link>
                      </Button>
                      <Button size="sm" variant="outline" disabled={savingId === product.id} onClick={() => togglePublish(product)}>
                        {product.is_published ? 'إخفاء' : 'إظهار'}
                      </Button>
                      <Button size="sm" variant="destructive" disabled={savingId === product.id} onClick={() => deleteProduct(product.id)}>
                        حذف
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
