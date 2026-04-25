'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { Category } from '@/types/category'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategory, setNewCategory] = useState({
    name_ar: '',
    name_en: '',
    slug: '',
    image_url: '',
    description_ar: '',
    gallery_images: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories?includeInactive=true')
        const data = await res.json()
        if (data.success) {
          setCategories(data.data)
        } else {
          setError(data.error?.message || 'تعذر تحميل الفئات')
        }
      } catch {
        setError('تعذر تحميل الفئات')
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCategory,
          slug: newCategory.slug || slugify(newCategory.name_en),
          image_url: newCategory.image_url || null,
          description_ar: newCategory.description_ar || null,
          gallery_images: newCategory.gallery_images
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setCategories((current) => [...current, data.data])
        setNewCategory({ name_ar: '', name_en: '', slug: '', image_url: '', description_ar: '', gallery_images: '' })
        setSuccess('تمت إضافة الفئة بنجاح')
      } else {
        setError(data.error?.message || 'تعذر إضافة الفئة')
      }
    } catch {
      setError('حدث خطأ أثناء إضافة الفئة')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('purpose', 'category')
      const res = await fetch('/api/upload', { method: 'POST', body })
      const data = await res.json()
      if (data.success) {
        setNewCategory((current) => ({ ...current, image_url: data.data.url }))
      }
    } finally {
      setUploading(false)
    }
  }

  const toggleCategory = async (category: Category) => {
    setSavingId(category.id)
    setError('')
    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !category.is_active }),
      })
      const data = await res.json()
      if (data.success) {
        setCategories((current) => current.map((item) => (item.id === category.id ? data.data : item)))
      } else {
        setError(data.error?.message || 'تعذر تحديث الفئة')
      }
    } catch {
      setError('تعذر تحديث الفئة')
    } finally {
      setSavingId(null)
    }
  }

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('هل تريد حذف الفئة؟')) return
    setSavingId(categoryId)
    setError('')
    try {
      const res = await fetch(`/api/categories/${categoryId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setCategories((current) => current.filter((item) => item.id !== categoryId))
      } else {
        setError(data.error?.message || 'تعذر حذف الفئة')
      }
    } catch {
      setError('تعذر حذف الفئة')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">الفئات</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة فئات المتجر وإضافة فئات جديدة بشكل مباشر.</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="grid gap-4 md:grid-cols-3 items-end">
        <div className="space-y-2">
          <label htmlFor="category-name-ar" className="text-sm font-medium">الاسم العربي</label>
          <Input id="category-name-ar" value={newCategory.name_ar} onChange={(e) => setNewCategory({ ...newCategory, name_ar: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <label htmlFor="category-name-en" className="text-sm font-medium">الاسم الإنجليزي</label>
          <Input id="category-name-en" value={newCategory.name_en} onChange={(e) => setNewCategory({ ...newCategory, name_en: e.target.value, slug: newCategory.slug || slugify(e.target.value) })} required />
        </div>
        <div className="space-y-2">
          <label htmlFor="category-slug" className="text-sm font-medium">الرابط</label>
          <Input
            id="category-slug"
            value={newCategory.slug}
            onChange={(e) => setNewCategory({ ...newCategory, slug: slugify(e.target.value) })}
            placeholder="auto-generated-slug"
          />
        </div>
        <div className="space-y-2 md:col-span-3">
          <label htmlFor="category-image-url" className="text-sm font-medium">صورة الغلاف</label>
          <Input id="category-image-url" value={newCategory.image_url} onChange={(e) => setNewCategory({ ...newCategory, image_url: e.target.value })} placeholder="https://..." />
        </div>
        <div className="space-y-2 md:col-span-3">
          <label htmlFor="category-image-upload" className="text-sm font-medium">رفع صورة من الكمبيوتر</label>
          <Input id="category-image-upload" type="file" accept="image/*" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(file) }} />
        </div>
        <div className="space-y-2 md:col-span-3">
          <label htmlFor="category-description-ar" className="text-sm font-medium">الوصف</label>
          <textarea id="category-description-ar" value={newCategory.description_ar} onChange={(e) => setNewCategory({ ...newCategory, description_ar: e.target.value })} className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div className="space-y-2 md:col-span-3">
          <label htmlFor="category-gallery-images" className="text-sm font-medium">صور إضافية للفئة</label>
          <textarea id="category-gallery-images" value={newCategory.gallery_images} onChange={(e) => setNewCategory({ ...newCategory, gallery_images: e.target.value })} placeholder="رابط صورة في كل سطر" className="min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div className="md:col-span-3 flex items-center gap-4">
          <Button type="submit" disabled={submitting}>{submitting ? 'جاري الإضافة...' : 'إضافة فئة'}</Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
        </div>
      </form>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-right font-medium">الاسم العربي</th>
                <th className="px-4 py-3 text-right font-medium">الاسم الإنجليزي</th>
                <th className="px-4 py-3 text-right font-medium">الرابط</th>
                <th className="px-4 py-3 text-right font-medium">الصورة</th>
                <th className="px-4 py-3 text-right font-medium">الحالة</th>
                <th className="px-4 py-3 text-right font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3">{cat.name_ar}</td>
                  <td className="px-4 py-3">{cat.name_en}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cat.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cat.image_url ? 'مضافة' : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${cat.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {cat.is_active ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" disabled={savingId === cat.id} onClick={() => toggleCategory(cat)}>
                        {cat.is_active ? 'إخفاء' : 'إظهار'}
                      </Button>
                      <Button size="sm" variant="destructive" disabled={savingId === cat.id} onClick={() => deleteCategory(cat.id)}>
                        حذف
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr className="border-t">
                  <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                    لا توجد فئات حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
