'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { ProductInventoryFields } from '@/components/admin/ProductInventoryFields'
import {
  type AdminProductUiConfig,
  DEFAULT_PRODUCT_UI_CONFIG,
  getDerivedStockQuantity,
  hydrateProductUiConfig,
  parseDigitalInventoryText,
} from '@/components/admin/product-ui-config'
import { AdminEmptyState, AdminPageHeader, AdminPanel } from '@/components/admin/AdminShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useUIStore } from '@/stores/ui-store'
import type { Product } from '@/types/product'

interface EditableProduct extends Product {
  tags: string[]
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const locale = useUIStore((state) => state.locale)
  const [product, setProduct] = useState<EditableProduct | null>(null)
  const [productUiConfig, setProductUiConfig] = useState<AdminProductUiConfig>(DEFAULT_PRODUCT_UI_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const copy = locale === 'ar'
    ? {
        eyebrow: 'تحرير الكتالوج',
        title: 'تعديل المنتج',
        description: 'حدّث بيانات المنتج والمخزون والنشر والتسليم من نفس الصفحة.',
        back: 'العودة للمنتجات',
        basic: 'المعلومات الأساسية',
        pricing: 'السعر والمخزون',
        nameAr: 'الاسم (عربي)',
        nameEn: 'الاسم (إنجليزي)',
        descriptionAr: 'الوصف (عربي)',
        descriptionEn: 'الوصف (إنجليزي)',
        images: 'الصور',
        upload: 'رفع صورة جديدة',
        uploading: 'جاري رفع الصورة...',
        price: 'السعر',
        promoPrice: 'سعر التخفيض',
        lowStock: 'حد التنبيه للمخزون',
        published: 'منشور',
        featured: 'مميز',
        saving: 'جاري الحفظ...',
        save: 'حفظ التغييرات',
        cancel: 'إلغاء',
        notFound: 'المنتج غير موجود',
        failed: 'فشل التحديث',
        unexpected: 'حدث خطأ أثناء تحديث المنتج',
      }
    : {
        eyebrow: 'Catalog editing',
        title: 'Edit product',
        description: 'Update product details, inventory, publishing, and delivery behavior from one page.',
        back: 'Back to products',
        basic: 'Basic information',
        pricing: 'Pricing and inventory',
        nameAr: 'Name (Arabic)',
        nameEn: 'Name (English)',
        descriptionAr: 'Description (Arabic)',
        descriptionEn: 'Description (English)',
        images: 'Images',
        upload: 'Upload new image',
        uploading: 'Uploading image...',
        price: 'Price',
        promoPrice: 'Promo price',
        lowStock: 'Low-stock threshold',
        published: 'Published',
        featured: 'Featured',
        saving: 'Saving...',
        save: 'Save changes',
        cancel: 'Cancel',
        notFound: 'Product not found',
        failed: 'Failed to update the product',
        unexpected: 'An error occurred while updating the product',
      }

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
    setError('')
    setMessage('')

    try {
      const payload = {
        ...product,
        product_type: productUiConfig.productType,
        stock_quantity: getDerivedStockQuantity(productUiConfig.productType, String(product.stock_quantity), productUiConfig),
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
        setMessage(locale === 'ar' ? 'تم تحديث المنتج بنجاح' : 'Product updated successfully')
        router.push('/admin/products')
      } else {
        setError(data.error?.message || copy.failed)
      }
    } catch {
      setError(copy.unexpected)
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
      <div className="max-w-4xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
        <Skeleton className="h-96 rounded-[28px]" />
      </div>
    )
  }

  if (!product) {
    return <AdminEmptyState title={copy.notFound} />
  }

  const storageWarning = null

  return (
    <div className="max-w-4xl space-y-6">
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={(
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
              {copy.back}
            </Link>
          </Button>
        )}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <AdminPanel title={copy.basic}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-product-name-ar">{copy.nameAr}</Label>
              <Input id="edit-product-name-ar" value={product.name_ar} onChange={(e) => setProduct({ ...product, name_ar: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product-name-en">{copy.nameEn}</Label>
              <Input id="edit-product-name-en" value={product.name_en} onChange={(e) => setProduct({ ...product, name_en: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product-description-ar">{copy.descriptionAr}</Label>
              <textarea id="edit-product-description-ar" value={product.description_ar || ''} onChange={(e) => setProduct({ ...product, description_ar: e.target.value })} className="min-h-[120px] w-full rounded-[20px] border border-input bg-background px-4 py-3 text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product-description-en">{copy.descriptionEn}</Label>
              <textarea id="edit-product-description-en" value={product.description_en || ''} onChange={(e) => setProduct({ ...product, description_en: e.target.value })} className="min-h-[120px] w-full rounded-[20px] border border-input bg-background px-4 py-3 text-sm" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-product-images">{copy.images}</Label>
              <textarea
                id="edit-product-images"
                value={product.images.join('\n')}
                onChange={(e) => setProduct({ ...product, images: e.target.value.split('\n').map((item) => item.trim()).filter(Boolean) })}
                className="min-h-[120px] w-full rounded-[20px] border border-input bg-background px-4 py-3 text-sm"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-product-upload">{copy.upload}</Label>
              <Input id="edit-product-upload" type="file" accept="image/*" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(file) }} />
              {uploading && <p className="text-xs text-muted-foreground">{copy.uploading}</p>}
            </div>
          </div>
        </AdminPanel>

        <AdminPanel title={copy.pricing}>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-product-price">{copy.price}</Label>
                <Input id="edit-product-price" type="number" step="0.01" value={product.price} onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) || 0 })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-product-promo-price">{copy.promoPrice}</Label>
                <Input id="edit-product-promo-price" type="number" step="0.01" value={product.promo_price ?? ''} onChange={(e) => setProduct({ ...product, promo_price: e.target.value ? parseFloat(e.target.value) : null })} />
              </div>
            </div>

            <ProductInventoryFields
              locale={locale === 'ar' ? 'ar' : 'en'}
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
              <Label htmlFor="edit-product-low-stock-threshold">{copy.lowStock}</Label>
              <Input id="edit-product-low-stock-threshold" type="number" value={product.low_stock_threshold || 3} onChange={(e) => setProduct({ ...product, low_stock_threshold: parseInt(e.target.value || '0', 10) || 0 })} />
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={product.is_published} onChange={(e) => setProduct({ ...product, is_published: e.target.checked })} />
                {copy.published}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={product.is_featured} onChange={(e) => setProduct({ ...product, is_featured: e.target.checked })} />
                {copy.featured}
              </label>
            </div>
          </div>
        </AdminPanel>

        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? copy.saving : copy.save}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>{copy.cancel}</Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? <p className="text-sm text-green-600">{message}</p> : null}
        </div>
      </form>
    </div>
  )
}
