'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProductInventoryFields } from '@/components/admin/ProductInventoryFields'
import {
  type AdminProductUiConfig,
  DEFAULT_PRODUCT_UI_CONFIG,
  getDerivedStockQuantity,
  hydrateProductUiConfig,
  parseDigitalInventoryText,
} from '@/components/admin/product-ui-config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import type { Product } from '@/types/product'

interface EditableProduct extends Product {
  tags: string[]
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const [product, setProduct] = useState<EditableProduct | null>(null)
  const [productUiConfig, setProductUiConfig] = useState<AdminProductUiConfig>(DEFAULT_PRODUCT_UI_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${params.id}?includeUnpublished=true`)
        const data = await res.json()
        if (data.success) {
          const nextProduct = { ...data.data, tags: data.data.tags || [] } as EditableProduct
          setProduct(nextProduct)

          setProductUiConfig(hydrateProductUiConfig(nextProduct))
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchProduct()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return
    setSaving(true)

    try {
      const payload = {
        ...product,
        product_type: productUiConfig.productType,
        stock_quantity: getDerivedStockQuantity(productUiConfig.productType, product.stock_quantity, productUiConfig),
        variants: productUiConfig.variants.map((variant, index) => ({
          id: variant.id,
          sku: variant.sku || null,
          size: variant.size || null,
          color: variant.color || null,
          name_ar: variant.name_ar || null,
          name_en: variant.name_en || null,
          price_override: variant.price_override,
          promo_price_override: variant.promo_price_override ?? null,
          stock_quantity: variant.stock_quantity,
          low_stock_threshold: variant.low_stock_threshold ?? (product.low_stock_threshold ?? 3),
          is_active: variant.is_active ?? true,
          sort_order: variant.sort_order ?? index,
        })),
        digital_inventory_units: parseDigitalInventoryText(productUiConfig.digitalInventoryText, productUiConfig.productType),
      }

      const res = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        router.push('/admin/products')
      } else {
        alert(data.error?.message || 'فشل التحديث')
      }
    } catch {
      alert('حدث خطأ')
    } finally {
      setSaving(false)
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
      if (data.success && product) {
        setProduct({ ...product, images: [...product.images, data.data.url] })
      }
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!product) {
    return <div className="py-12 text-center">المنتج غير موجود</div>
  }

  const storageWarning = null

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">تعديل المنتج</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>المعلومات الأساسية</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-product-name-ar">الاسم (عربي)</Label>
              <Input id="edit-product-name-ar" value={product.name_ar} onChange={(e) => setProduct({ ...product, name_ar: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product-name-en">الاسم (إنجليزي)</Label>
              <Input id="edit-product-name-en" value={product.name_en} onChange={(e) => setProduct({ ...product, name_en: e.target.value })} required />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-product-description-ar">الوصف (عربي)</Label>
                <textarea id="edit-product-description-ar" value={product.description_ar || ''} onChange={(e) => setProduct({ ...product, description_ar: e.target.value })} className="min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-product-description-en">الوصف (إنجليزي)</Label>
                <textarea id="edit-product-description-en" value={product.description_en || ''} onChange={(e) => setProduct({ ...product, description_en: e.target.value })} className="min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product-images">الصور</Label>
              <textarea
                id="edit-product-images"
                value={product.images.join('\n')}
                onChange={(e) => setProduct({ ...product, images: e.target.value.split('\n').map((item) => item.trim()).filter(Boolean) })}
                className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product-upload">رفع صورة جديدة</Label>
              <Input id="edit-product-upload" type="file" accept="image/*" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(file) }} />
              {uploading && <p className="text-xs text-muted-foreground">جاري رفع الصورة...</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>السعر والمخزون</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-product-price">السعر</Label>
              <Input id="edit-product-price" type="number" step="0.01" value={product.price} onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) || 0 })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product-promo-price">سعر التخفيض</Label>
              <Input id="edit-product-promo-price" type="number" step="0.01" value={product.promo_price ?? ''} onChange={(e) => setProduct({ ...product, promo_price: e.target.value ? parseFloat(e.target.value) : null })} />
            </div>

            <ProductInventoryFields
              productType={productUiConfig.productType}
              onProductTypeChange={(value) => setProductUiConfig((current) => ({ ...current, productType: value }))}
              manualStockQuantity={String(product.stock_quantity)}
              onManualStockQuantityChange={(value) => setProduct({ ...product, stock_quantity: parseInt(value || '0', 10) || 0 })}
              variants={productUiConfig.variants}
              onVariantsChange={(value) => setProductUiConfig((current) => ({ ...current, variants: value }))}
              digitalInventoryText={productUiConfig.digitalInventoryText}
              onDigitalInventoryTextChange={(value) => setProductUiConfig((current) => ({ ...current, digitalInventoryText: value }))}
              lowStockThreshold={String(product.low_stock_threshold || 3)}
              storageWarning={storageWarning}
            />

            <div className="space-y-2">
              <Label htmlFor="edit-product-low-stock-threshold">حد التنبيه للمخزون</Label>
              <Input id="edit-product-low-stock-threshold" type="number" value={product.low_stock_threshold || 3} onChange={(e) => setProduct({ ...product, low_stock_threshold: parseInt(e.target.value || '0', 10) || 0 })} />
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={product.is_published} onChange={(e) => setProduct({ ...product, is_published: e.target.checked })} />
                منشور
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={product.is_featured} onChange={(e) => setProduct({ ...product, is_featured: e.target.checked })} />
                مميز
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>إلغاء</Button>
        </div>
      </form>
    </div>
  )
}
