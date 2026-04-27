'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProductInventoryFields } from '@/components/admin/ProductInventoryFields'
import {
  type AdminProductUiConfig,
  DEFAULT_PRODUCT_UI_CONFIG,
  getDerivedStockQuantity,
  parseDigitalInventoryText,
} from '@/components/admin/product-ui-config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Category {
  id: string
  name_ar: string
  name_en: string
  is_active: boolean
}

interface SupplierOption {
  id: string
  name: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([])
  const [productUiConfig, setProductUiConfig] = useState<AdminProductUiConfig>(DEFAULT_PRODUCT_UI_CONFIG)
  const [form, setForm] = useState({
    name_ar: '',
    name_en: '',
    price: '',
    category_id: '',
    stock_quantity: '0',
    description_ar: '',
    description_en: '',
    promo_price: '',
    images: '',
    is_published: true,
    is_featured: false,
    supplier_id: '',
    low_stock_threshold: '3',
    tags: [] as string[],
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data)
      })
      .catch(() => {})

    fetch('/api/suppliers')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSuppliers(data.data)
      })
      .catch(() => {})
  }, [])

  const storageWarning = null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const derivedStockQuantity = getDerivedStockQuantity(productUiConfig.productType, form.stock_quantity, productUiConfig)

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          stock_quantity: derivedStockQuantity,
          promo_price: form.promo_price ? parseFloat(form.promo_price) : null,
          description_ar: form.description_ar || null,
          description_en: form.description_en || null,
          product_type: productUiConfig.productType,
          is_published: form.is_published,
          is_featured: form.is_featured,
          supplier_id: form.supplier_id || null,
          low_stock_threshold: parseInt(form.low_stock_threshold, 10) || 3,
          images: form.images.split('\n').map((item) => item.trim()).filter(Boolean),
          tags: form.tags,
          variants: productUiConfig.variants.map((variant, index) => ({
            sku: variant.sku || null,
            size: variant.size || null,
            color: variant.color || null,
            name_ar: variant.name_ar || null,
            name_en: variant.name_en || null,
            price_override: variant.price_override,
            promo_price_override: variant.promo_price_override ?? null,
            stock_quantity: variant.stock_quantity,
            low_stock_threshold: variant.low_stock_threshold ?? (parseInt(form.low_stock_threshold, 10) || 3),
            is_active: variant.is_active ?? true,
            sort_order: variant.sort_order ?? index,
          })),
          digital_inventory_units: parseDigitalInventoryText(productUiConfig.digitalInventoryText),
        }),
      })

      const data = await res.json()
      if (data.success) {
        router.push('/admin/products')
      } else {
        alert(data.error?.message || 'Failed to create product')
      }
    } catch {
      alert('Error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('purpose', 'product')
      const res = await fetch('/api/upload', { method: 'POST', body })
      const data = await res.json()
      if (data.success) {
        setForm((current) => ({
          ...current,
          images: [current.images, data.data.url].filter(Boolean).join('\n'),
        }))
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">إضافة منتج جديد</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>المعلومات الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-name-ar">الاسم (عربي) *</Label>
              <Input id="product-name-ar" value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-name-en">الاسم (إنجليزي) *</Label>
              <Input id="product-name-en" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-category">الفئة *</Label>
              <select
                id="product-category"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">-- اختر فئة --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_ar} ({cat.name_en})
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-sm text-muted-foreground">لا توجد فئات بعد. <a href="/admin/categories" className="text-primary underline">أضف فئة أولاً</a></p>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product-description-ar">الوصف (عربي)</Label>
                <textarea id="product-description-ar" value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} className="min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-description-en">الوصف (إنجليزي)</Label>
                <textarea id="product-description-en" value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} className="min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>السعر والمخزون</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-price">السعر *</Label>
              <Input id="product-price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-promo-price">سعر التخفيض</Label>
              <Input id="product-promo-price" type="number" step="0.01" value={form.promo_price} onChange={(e) => setForm({ ...form, promo_price: e.target.value })} />
            </div>

            <ProductInventoryFields
              productType={productUiConfig.productType}
              onProductTypeChange={(value) => setProductUiConfig((current) => ({ ...current, productType: value }))}
              manualStockQuantity={form.stock_quantity}
              onManualStockQuantityChange={(value) => setForm({ ...form, stock_quantity: value })}
              variants={productUiConfig.variants}
              onVariantsChange={(value) => setProductUiConfig((current) => ({ ...current, variants: value }))}
              digitalInventoryText={productUiConfig.digitalInventoryText}
              onDigitalInventoryTextChange={(value) => setProductUiConfig((current) => ({ ...current, digitalInventoryText: value }))}
              lowStockThreshold={form.low_stock_threshold}
              storageWarning={storageWarning}
            />

            <div className="space-y-2">
              <Label htmlFor="product-low-stock-threshold">حد التنبيه للمخزون</Label>
              <Input id="product-low-stock-threshold" type="number" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-supplier">المورد</Label>
              <select
                id="product-supplier"
                value={form.supplier_id}
                onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">-- بدون مورد --</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-images">صور المنتج</Label>
              <textarea id="product-images" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className="min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="رابط صورة في كل سطر" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-image-upload">رفع من الكمبيوتر</Label>
              <Input id="product-image-upload" type="file" accept="image/*" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(file) }} />
              {uploading && <p className="text-xs text-muted-foreground">جاري رفع الصورة...</p>}
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
                منشور
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                مميز
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>{loading ? 'جاري الحفظ...' : 'حفظ المنتج'}</Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>إلغاء</Button>
        </div>
      </form>
    </div>
  )
}
