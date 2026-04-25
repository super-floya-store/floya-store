'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Product } from '@/types/product'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${params.id}?includeUnpublished=true`)
        const data = await res.json()
        if (data.success) setProduct(data.data)
      } catch { /* ignore */ } finally { setLoading(false) }
    }
    if (params.id) fetchProduct()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return
    setSaving(true)

    try {
      const res = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
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
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!product) {
    return <div className="text-center py-12">المنتج غير موجود</div>
  }

  return (
    <div className="space-y-6 max-w-2xl">
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
            <div className="space-y-2">
              <Label htmlFor="edit-product-price">السعر</Label>
              <Input id="edit-product-price" type="number" value={product.price} onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product-stock">المخزون</Label>
              <Input id="edit-product-stock" type="number" value={product.stock_quantity} onChange={(e) => setProduct({ ...product, stock_quantity: parseInt(e.target.value) })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product-low-stock-threshold">حد التنبيه للمخزون</Label>
              <Input id="edit-product-low-stock-threshold" type="number" value={product.low_stock_threshold || 3} onChange={(e) => setProduct({ ...product, low_stock_threshold: parseInt(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product-description">الوصف</Label>
              <textarea id="edit-product-description" value={product.description_ar || ''} onChange={(e) => setProduct({ ...product, description_ar: e.target.value })} className="min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
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
