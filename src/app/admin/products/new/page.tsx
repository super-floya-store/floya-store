'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { ProductInventoryFields } from '@/components/admin/ProductInventoryFields'
import {
  type AdminProductUiConfig,
  DEFAULT_PRODUCT_UI_CONFIG,
  getDerivedStockQuantity,
  parseDigitalInventoryText,
} from '@/components/admin/product-ui-config'
import { AdminPageHeader, AdminPanel } from '@/components/admin/AdminShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useUIStore } from '@/stores/ui-store'

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
  const locale = useUIStore((state) => state.locale)
  const [loading, setLoading] = useState(false)
  const [bootLoading, setBootLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([])
  const [productUiConfig, setProductUiConfig] = useState<AdminProductUiConfig>(DEFAULT_PRODUCT_UI_CONFIG)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
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
  const copy = locale === 'ar'
    ? {
        eyebrow: 'بناء الكتالوج',
        title: 'إضافة منتج جديد',
        description: 'أضف منتجاً جديداً مع النوع المناسب والمخزون والصور وبيانات النشر.',
        back: 'العودة للمنتجات',
        basic: 'المعلومات الأساسية',
        pricing: 'السعر والمخزون',
        nameAr: 'الاسم (عربي) *',
        nameEn: 'الاسم (إنجليزي) *',
        category: 'الفئة *',
        noCategory: 'لا توجد فئات بعد.',
        addCategoryFirst: 'أضف فئة أولاً',
        descriptionAr: 'الوصف (عربي)',
        descriptionEn: 'الوصف (إنجليزي)',
        price: 'السعر *',
        promoPrice: 'سعر التخفيض',
        lowStock: 'حد التنبيه للمخزون',
        supplier: 'المورد',
        noSupplier: '-- بدون مورد --',
        images: 'صور المنتج',
        imagePlaceholder: 'رابط صورة في كل سطر',
        upload: 'رفع من الكمبيوتر',
        uploading: 'جاري رفع الصورة...',
        published: 'منشور',
        featured: 'مميز',
        saving: 'جاري الحفظ...',
        save: 'حفظ المنتج',
        cancel: 'إلغاء',
        chooseCategory: '-- اختر فئة --',
        failed: 'فشل إنشاء المنتج',
        unexpected: 'حدث خطأ أثناء إنشاء المنتج',
      }
    : {
        eyebrow: 'Catalog build',
        title: 'Add new product',
        description: 'Create a new product with the right type, stock model, images, and publishing details.',
        back: 'Back to products',
        basic: 'Basic information',
        pricing: 'Pricing and inventory',
        nameAr: 'Name (Arabic) *',
        nameEn: 'Name (English) *',
        category: 'Category *',
        noCategory: 'There are no categories yet.',
        addCategoryFirst: 'Add a category first',
        descriptionAr: 'Description (Arabic)',
        descriptionEn: 'Description (English)',
        price: 'Price *',
        promoPrice: 'Promo price',
        lowStock: 'Low-stock threshold',
        supplier: 'Supplier',
        noSupplier: '-- No supplier --',
        images: 'Product images',
        imagePlaceholder: 'One image URL per line',
        upload: 'Upload from device',
        uploading: 'Uploading image...',
        published: 'Published',
        featured: 'Featured',
        saving: 'Saving...',
        save: 'Save product',
        cancel: 'Cancel',
        chooseCategory: '-- Choose a category --',
        failed: 'Failed to create product',
        unexpected: 'An error occurred while creating the product',
      }

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((res) => res.json()).catch(() => null),
      fetch('/api/suppliers').then((res) => res.json()).catch(() => null),
    ]).then(([categoryData, supplierData]) => {
      if (categoryData?.success) setCategories(categoryData.data)
      if (supplierData?.success) setSuppliers(supplierData.data)
    }).finally(() => setBootLoading(false))
  }, [])

  const storageWarning = null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

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
          digital_inventory_units: parseDigitalInventoryText(productUiConfig.digitalInventoryText, productUiConfig.productType),
        }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage(locale === 'ar' ? 'تم إنشاء المنتج بنجاح' : 'Product created successfully')
        router.push('/admin/products')
      } else {
        setError(data.error?.message || copy.failed)
      }
    } catch {
      setError(copy.unexpected)
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

  if (bootLoading) {
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
              <Label htmlFor="product-name-ar">{copy.nameAr}</Label>
              <Input id="product-name-ar" value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-name-en">{copy.nameEn}</Label>
              <Input id="product-name-en" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="product-category">{copy.category}</Label>
              <select
                id="product-category"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                required
                className="flex h-11 w-full rounded-full border border-input bg-background px-4 py-2 text-sm"
              >
                <option value="">{copy.chooseCategory}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {locale === 'ar' ? `${cat.name_ar} (${cat.name_en})` : `${cat.name_en} (${cat.name_ar})`}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-sm text-muted-foreground">{copy.noCategory} <Link href="/admin/categories" className="text-primary underline">{copy.addCategoryFirst}</Link></p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-description-ar">{copy.descriptionAr}</Label>
              <textarea id="product-description-ar" value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} className="min-h-[120px] w-full rounded-[20px] border border-input bg-background px-4 py-3 text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-description-en">{copy.descriptionEn}</Label>
              <textarea id="product-description-en" value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} className="min-h-[120px] w-full rounded-[20px] border border-input bg-background px-4 py-3 text-sm" />
            </div>
          </div>
        </AdminPanel>

        <AdminPanel title={copy.pricing}>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product-price">{copy.price}</Label>
                <Input id="product-price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-promo-price">{copy.promoPrice}</Label>
                <Input id="product-promo-price" type="number" step="0.01" value={form.promo_price} onChange={(e) => setForm({ ...form, promo_price: e.target.value })} />
              </div>
            </div>

            <ProductInventoryFields
              locale={locale === 'ar' ? 'ar' : 'en'}
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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product-low-stock-threshold">{copy.lowStock}</Label>
                <Input id="product-low-stock-threshold" type="number" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-supplier">{copy.supplier}</Label>
                <select
                  id="product-supplier"
                  value={form.supplier_id}
                  onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                  className="flex h-11 w-full rounded-full border border-input bg-background px-4 py-2 text-sm"
                >
                  <option value="">{copy.noSupplier}</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-images">{copy.images}</Label>
              <textarea id="product-images" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className="min-h-[120px] w-full rounded-[20px] border border-input bg-background px-4 py-3 text-sm" placeholder={copy.imagePlaceholder} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-image-upload">{copy.upload}</Label>
              <Input id="product-image-upload" type="file" accept="image/*" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(file) }} />
              {uploading && <p className="text-xs text-muted-foreground">{copy.uploading}</p>}
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
                {copy.published}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                {copy.featured}
              </label>
            </div>
          </div>
        </AdminPanel>

        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4" />
            {loading ? copy.saving : copy.save}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>{copy.cancel}</Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? <p className="text-sm text-green-600">{message}</p> : null}
        </div>
      </form>
    </div>
  )
}
