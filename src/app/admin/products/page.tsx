'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Download, PackagePlus, Search, Upload } from 'lucide-react'
import { getProductTypeLabel, getProductTypeTone } from '@/components/admin/product-ui-config'
import { AdminEmptyState, AdminPageHeader, AdminPanel, AdminToolbar } from '@/components/admin/AdminShell'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useUIStore } from '@/stores/ui-store'
import { formatNumber, formatPrice } from '@/lib/utils/format'
import type { Product } from '@/types/product'

export default function AdminProductsPage() {
  const locale = useUIStore((state) => state.locale)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkValue, setBulkValue] = useState('')
  const [csvText, setCsvText] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | Product['product_type']>('all')
  const copy = locale === 'ar'
    ? {
        eyebrow: 'إدارة الكتالوج',
        title: 'المنتجات',
        description: 'صفحة موحدة لإدارة النشر والمخزون والاستيراد الجماعي وتحرير المنتجات بجميع أنواعها.',
        exportCsv: 'تصدير CSV',
        addProduct: 'إضافة منتج',
        search: 'ابحث بالاسم أو الرابط',
        allStatuses: 'كل الحالات',
        published: 'منشور',
        draft: 'مسودة',
        allTypes: 'كل الأنواع',
        bulkActions: 'الإجراءات الجماعية',
        importTitle: 'استيراد CSV',
        importPlaceholder: 'الصق محتوى CSV هنا',
        importAction: 'استيراد',
        publishSelected: 'نشر المحدد',
        hideSelected: 'إخفاء المحدد',
        setStock: 'تعيين المخزون',
        adjustStock: 'تعديل المخزون',
        setPrice: 'تعيين السعر',
        adjustPrice: 'تعديل % السعر',
        bulkValue: 'القيمة',
        bulkFailed: 'تعذر تنفيذ العملية الجماعية',
        importSuccess: 'تمت إضافة',
        importFailed: 'تعذر استيراد CSV',
        updateFailed: 'تعذر تحديث حالة المنتج',
        deleteConfirm: 'هل تريد حذف المنتج أو إخفاءه؟',
        softDeleted: 'تم إخفاء المنتج لأنه مرتبط بطلبات سابقة',
        deleteFailed: 'تعذر حذف المنتج',
        image: 'الصورة',
        name: 'الاسم',
        type: 'النوع',
        price: 'السعر',
        stock: 'المخزون',
        threshold: 'التنبيه',
        status: 'الحالة',
        actions: 'الإجراءات',
        edit: 'تعديل',
        hide: 'إخفاء',
        show: 'إظهار',
        delete: 'حذف',
        directStock: 'مخزون مباشر',
        variants: 'متغير',
        digitalUnits: 'عنصر رقمي',
        noProducts: 'لا توجد منتجات تطابق الفلاتر الحالية',
        noProductsDescription: 'غيّر البحث أو الفلاتر، أو أضف منتجاً جديداً لبدء الكتالوج.',
      }
    : {
        eyebrow: 'Catalog management',
        title: 'Products',
        description: 'A unified page for publishing, stock control, bulk import, and product editing across all product types.',
        exportCsv: 'Export CSV',
        addProduct: 'Add product',
        search: 'Search by name or slug',
        allStatuses: 'All statuses',
        published: 'Published',
        draft: 'Draft',
        allTypes: 'All types',
        bulkActions: 'Bulk actions',
        importTitle: 'CSV import',
        importPlaceholder: 'Paste CSV content here',
        importAction: 'Import',
        publishSelected: 'Publish selected',
        hideSelected: 'Hide selected',
        setStock: 'Set stock',
        adjustStock: 'Adjust stock',
        setPrice: 'Set price',
        adjustPrice: 'Adjust price %',
        bulkValue: 'Value',
        bulkFailed: 'Unable to run the bulk action',
        importSuccess: 'Inserted',
        importFailed: 'Unable to import CSV',
        updateFailed: 'Unable to update the product state',
        deleteConfirm: 'Do you want to delete or hide this product?',
        softDeleted: 'The product was hidden because it is linked to past orders',
        deleteFailed: 'Unable to delete the product',
        image: 'Image',
        name: 'Name',
        type: 'Type',
        price: 'Price',
        stock: 'Stock',
        threshold: 'Threshold',
        status: 'Status',
        actions: 'Actions',
        edit: 'Edit',
        hide: 'Hide',
        show: 'Show',
        delete: 'Delete',
        directStock: 'Direct stock',
        variants: 'variants',
        digitalUnits: 'digital units',
        noProducts: 'No products match the current filters',
        noProductsDescription: 'Change the search or filters, or add a new product to start the catalog.',
      }

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

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery = !query.trim() || [product.name_ar, product.name_en, product.slug].some((value) => value?.toLowerCase().includes(query.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'published' ? product.is_published : !product.is_published)
      const matchesType = typeFilter === 'all' || product.product_type === typeFilter
      return matchesQuery && matchesStatus && matchesType
    })
  }, [products, query, statusFilter, typeFilter])

  const allSelected = filteredProducts.length > 0 && filteredProducts.every((product) => selectedIds.includes(product.id))

  const toggleSelected = (productId: string) => {
    setSelectedIds((current) => current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId])
  }

  const refreshProducts = async () => {
    const refreshed = await fetch('/api/products?limit=100&includeUnpublished=true').then((response) => response.json())
    if (refreshed.success) setProducts(refreshed.data)
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
      alert(data.error?.message || copy.bulkFailed)
      return
    }

    await refreshProducts()
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
      await refreshProducts()
      alert(`${copy.importSuccess} ${data.data.insertedCount} ${locale === 'ar' ? 'منتج' : 'products'}`)
    } else {
      alert(data.error?.message || copy.importFailed)
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
        alert(data.error?.message || copy.updateFailed)
      }
    } finally {
      setSavingId(null)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm(copy.deleteConfirm)) return
    setSavingId(productId)
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        if (data.softDeleted && data.data) {
          setProducts((current) => current.map((item) => (item.id === productId ? { ...item, ...data.data } : item)))
          alert(copy.softDeleted)
        } else {
          setProducts((current) => current.filter((item) => item.id !== productId))
        }
      } else {
        alert(data.error?.message || copy.deleteFailed)
      }
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={(
          <>
            <Button variant="outline" className="rounded-full" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              {copy.exportCsv}
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/admin/products/new">
                <PackagePlus className="h-4 w-4" />
                {copy.addProduct}
              </Link>
            </Button>
          </>
        )}
      />

      <AdminToolbar>
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:flex-wrap">
          <label className="relative min-w-[260px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.search}
              className="h-11 w-full rounded-full border border-border bg-white pl-10 pr-4 text-sm text-foreground shadow-soft outline-none ring-0"
            />
          </label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="h-11 rounded-full border border-border bg-white px-4 text-sm text-foreground shadow-soft">
            <option value="all">{copy.allStatuses}</option>
            <option value="published">{copy.published}</option>
            <option value="draft">{copy.draft}</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)} className="h-11 rounded-full border border-border bg-white px-4 text-sm text-foreground shadow-soft">
            <option value="all">{copy.allTypes}</option>
            <option value="physical_simple">{locale === 'ar' ? 'مادي بسيط' : 'Simple physical'}</option>
            <option value="physical_variant">{locale === 'ar' ? 'بمتغيرات' : 'Variant product'}</option>
            <option value="digital_account">{locale === 'ar' ? 'حساب رقمي' : 'Digital account'}</option>
            <option value="digital_text">{locale === 'ar' ? 'نص رقمي' : 'Digital text'}</option>
          </select>
        </div>
        <div className="text-sm text-muted-foreground">
          {formatNumber(filteredProducts.length, locale)} / {formatNumber(products.length, locale)}
        </div>
      </AdminToolbar>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <AdminPanel title={copy.bulkActions} contentClassName="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={selectedIds.length === 0} onClick={() => runBulkAction('publish')}>{copy.publishSelected}</Button>
            <Button size="sm" variant="outline" disabled={selectedIds.length === 0} onClick={() => runBulkAction('unpublish')}>{copy.hideSelected}</Button>
            <Button size="sm" variant="outline" disabled={selectedIds.length === 0} onClick={() => runBulkAction('set_stock', Number(bulkValue || 0))}>{copy.setStock}</Button>
            <Button size="sm" variant="outline" disabled={selectedIds.length === 0} onClick={() => runBulkAction('adjust_stock', Number(bulkValue || 0))}>{copy.adjustStock}</Button>
            <Button size="sm" variant="outline" disabled={selectedIds.length === 0} onClick={() => runBulkAction('set_price', Number(bulkValue || 0))}>{copy.setPrice}</Button>
            <Button size="sm" variant="outline" disabled={selectedIds.length === 0} onClick={() => runBulkAction('adjust_price_percent', Number(bulkValue || 0))}>{copy.adjustPrice}</Button>
            <input value={bulkValue} onChange={(e) => setBulkValue(e.target.value)} type="number" placeholder={copy.bulkValue} className="h-9 rounded-full border border-border bg-white px-3 text-sm text-foreground shadow-soft" />
          </div>
        </AdminPanel>

        <AdminPanel title={copy.importTitle} contentClassName="space-y-3">
          <textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} placeholder={copy.importPlaceholder} className="min-h-[140px] w-full rounded-[20px] border border-border bg-white px-4 py-3 text-sm text-foreground shadow-soft" />
          <Button size="sm" onClick={importCsv}>
            <Upload className="h-4 w-4" />
            {copy.importAction}
          </Button>
        </AdminPanel>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-[24px]" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <AdminEmptyState title={copy.noProducts} description={copy.noProductsDescription} />
      ) : (
        <AdminPanel className="overflow-hidden" contentClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="px-4 py-4 text-right font-medium">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => setSelectedIds(allSelected ? selectedIds.filter((id) => !filteredProducts.some((product) => product.id === id)) : Array.from(new Set([...selectedIds, ...filteredProducts.map((product) => product.id)])))}
                    />
                  </th>
                  <th className="px-4 py-4 text-right font-medium">{copy.image}</th>
                  <th className="px-4 py-4 text-right font-medium">{copy.name}</th>
                  <th className="px-4 py-4 text-right font-medium">{copy.type}</th>
                  <th className="px-4 py-4 text-right font-medium">{copy.price}</th>
                  <th className="px-4 py-4 text-right font-medium">{copy.stock}</th>
                  <th className="px-4 py-4 text-right font-medium">{copy.threshold}</th>
                  <th className="px-4 py-4 text-right font-medium">{copy.status}</th>
                  <th className="px-4 py-4 text-right font-medium">{copy.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const typeLabel = getProductTypeLabel(product.product_type, locale === 'ar' ? 'ar' : 'en')
                  const typeTone = getProductTypeTone(product.product_type)
                  const metaText = product.product_type === 'physical_variant'
                    ? `${formatNumber(product.variants?.length || 0, locale)} ${copy.variants}`
                    : product.product_type === 'digital_account' || product.product_type === 'digital_text'
                      ? `${formatNumber(product.available_digital_units || 0, locale)} ${copy.digitalUnits}`
                      : copy.directStock

                  return (
                    <tr key={product.id} className="border-t border-border/70 hover:bg-muted/30">
                      <td className="px-4 py-4">
                        <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelected(product.id)} />
                      </td>
                      <td className="px-4 py-4">
                        {product.images[0] ? (
                          <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-muted">
                            <Image src={product.images[0]} alt={locale === 'ar' ? product.name_ar : product.name_en} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-2xl bg-muted" />
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-foreground">{locale === 'ar' ? product.name_ar : product.name_en}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{product.slug}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${typeTone}`}>
                          {typeLabel}
                        </span>
                        <p className="mt-2 text-xs text-muted-foreground">{metaText}</p>
                      </td>
                      <td className="px-4 py-4 font-semibold text-secondary"><bdi>{formatPrice(product.price, 'DZD', locale)}</bdi></td>
                      <td className="px-4 py-4">{formatNumber(product.stock_quantity, locale)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${(product.low_stock_threshold || 3) >= product.stock_quantity && product.stock_quantity > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                          {formatNumber(product.low_stock_threshold || 3, locale)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${product.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                          {product.is_published ? copy.published : copy.draft}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/admin/products/${product.id}/edit`}>{copy.edit}</Link>
                          </Button>
                          <Button size="sm" variant="outline" disabled={savingId === product.id} onClick={() => togglePublish(product)}>
                            {product.is_published ? copy.hide : copy.show}
                          </Button>
                          <Button size="sm" variant="destructive" disabled={savingId === product.id} onClick={() => deleteProduct(product.id)}>
                            {copy.delete}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </AdminPanel>
      )}
    </div>
  )
}
