'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, Shapes } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { Category } from '@/types/category'
import { useUIStore } from '@/stores/ui-store'
import { formatNumber } from '@/lib/utils/format'
import { AdminEmptyState, AdminPageHeader, AdminPanel, AdminStatCard, AdminToolbar } from '@/components/admin/AdminShell'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getAccessToken() {
  if (typeof document === 'undefined') return ''
  const tokenEntry = document.cookie
    .split('; ')
    .find((item) => item.startsWith('access_token='))

  return tokenEntry ? decodeURIComponent(tokenEntry.split('=').slice(1).join('=')) : ''
}

function getAuthHeaders(includeJson = false) {
  const token = getAccessToken()

  return {
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export default function AdminCategoriesPage() {
  const locale = useUIStore((state) => state.locale)
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
  const [query, setQuery] = useState('')
  const isRTL = locale === 'ar'
  const copy = isRTL
    ? {
        fetchError: 'تعذر تحميل الفئات',
        addSuccess: 'تمت إضافة الفئة بنجاح',
        addError: 'تعذر إضافة الفئة',
        addException: 'حدث خطأ أثناء إضافة الفئة',
        uploadExtraError: 'تعذر رفع الصور الإضافية',
        updateError: 'تعذر تحديث الفئة',
        confirmDelete: 'هل تريد حذف الفئة؟',
        hideSuccess: 'تم إخفاء الفئة لأنها تحتوي على منتجات',
        deleteError: 'تعذر حذف الفئة',
        eyebrow: 'تنظيم الكتالوج',
        title: 'الفئات',
        subtitle: 'إدارة فئات المتجر وإضافة فئات جديدة وصور مرتبطة بها من شاشة واحدة.',
        nameAr: 'الاسم العربي',
        nameEn: 'الاسم الإنجليزي',
        slug: 'الرابط',
        slugPlaceholder: 'store-category-slug',
        slugHelp: 'يُنشأ تلقائياً من الاسم الإنجليزي ويمكنك تعديله.',
        cover: 'صورة الغلاف',
        uploadCover: 'رفع صورة من الكمبيوتر',
        description: 'الوصف',
        gallery: 'صور إضافية للفئة',
        galleryPlaceholder: 'رابط صورة في كل سطر',
        adding: 'جاري الإضافة...',
        add: 'إضافة فئة',
        image: 'الصورة',
        status: 'الحالة',
        actions: 'الإجراءات',
        added: 'مضافة',
        active: 'نشط',
        inactive: 'معطل',
        hide: 'إخفاء',
        show: 'إظهار',
        delete: 'حذف',
        empty: 'لا توجد فئات حالياً',
        emptyDescription: 'أضف فئة جديدة لتبدأ في تنظيم الكتالوج.',
        search: 'ابحث باسم الفئة أو الرابط',
        count: 'الفئات',
      }
    : {
        fetchError: 'Unable to load categories',
        addSuccess: 'Category added successfully',
        addError: 'Unable to add category',
        addException: 'An error occurred while adding the category',
        uploadExtraError: 'Unable to upload the extra images',
        updateError: 'Unable to update the category',
        confirmDelete: 'Do you want to delete this category?',
        hideSuccess: 'The category was hidden because it still contains products',
        deleteError: 'Unable to delete the category',
        eyebrow: 'Catalog structure',
        title: 'Categories',
        subtitle: 'Manage store categories and their related imagery from one screen.',
        nameAr: 'Arabic name',
        nameEn: 'English name',
        slug: 'Slug',
        slugPlaceholder: 'store-category-slug',
        slugHelp: 'Generated from the English name by default, but you can edit it.',
        cover: 'Cover image',
        uploadCover: 'Upload image from device',
        description: 'Description',
        gallery: 'Additional category images',
        galleryPlaceholder: 'One image URL per line',
        adding: 'Adding...',
        add: 'Add category',
        image: 'Image',
        status: 'Status',
        actions: 'Actions',
        added: 'Added',
        active: 'Active',
        inactive: 'Hidden',
        hide: 'Hide',
        show: 'Show',
        delete: 'Delete',
        empty: 'No categories yet',
        emptyDescription: 'Add a new category to start organizing the catalog.',
        search: 'Search by category name or slug',
        count: 'Categories',
      }

  const appendGalleryUrls = (urls: string[]) => {
    setNewCategory((current) => {
      const existing = current.gallery_images
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)

      return {
        ...current,
        image_url: current.image_url || urls[0] || '',
        gallery_images: [...existing, ...urls].join('\n'),
      }
    })
  }

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories?includeInactive=true', {
          credentials: 'include',
          headers: getAuthHeaders(),
        })
        const data = await res.json()
        if (data.success) {
          setCategories(data.data)
        } else {
          setError(data.error?.message || copy.fetchError)
        }
      } catch {
        setError(copy.fetchError)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [copy.fetchError])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(true),
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
        setSuccess(copy.addSuccess)
      } else {
        setError(data.error?.message || copy.addError)
      }
    } catch {
      setError(copy.addException)
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
      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body,
      })
      const data = await res.json()
      if (data.success) {
        setNewCategory((current) => ({ ...current, image_url: data.data.url }))
      }
    } finally {
      setUploading(false)
    }
  }

  const handleGalleryUpload = async (files: FileList | File[]) => {
    setUploading(true)
    setError('')
    try {
      const uploadedUrls: string[] = []
      for (const file of Array.from(files)) {
        const body = new FormData()
        body.append('file', file)
        body.append('purpose', 'category')
        const res = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'include',
          headers: getAuthHeaders(),
          body,
        })
        const data = await res.json()
        if (!data.success) {
          throw new Error(data.error?.message || copy.uploadExtraError)
        }
        uploadedUrls.push(data.data.url)
      }

      appendGalleryUrls(uploadedUrls)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : copy.uploadExtraError)
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
        credentials: 'include',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ is_active: !category.is_active }),
      })
      const data = await res.json()
      if (data.success) {
        setCategories((current) => current.map((item) => (item.id === category.id ? data.data : item)))
      } else {
        setError(data.error?.message || copy.updateError)
      }
    } catch {
      setError(copy.updateError)
    } finally {
      setSavingId(null)
    }
  }

  const deleteCategory = async (categoryId: string) => {
    if (!confirm(copy.confirmDelete)) return
    setSavingId(categoryId)
    setError('')
    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      if (data.success) {
        if (data.softDeleted && data.data) {
          setCategories((current) => current.map((item) => (item.id === categoryId ? data.data : item)))
          setSuccess(copy.hideSuccess)
        } else {
          setCategories((current) => current.filter((item) => item.id !== categoryId))
        }
      } else {
        setError(data.error?.message || copy.deleteError)
      }
    } catch {
      setError(copy.deleteError)
    } finally {
      setSavingId(null)
    }
  }

  const filteredCategories = useMemo(() => {
    const normalized = query.toLowerCase().trim()
    if (!normalized) return categories
    return categories.filter((category) =>
      [category.name_ar, category.name_en, category.slug].some((value) => value.toLowerCase().includes(normalized))
    )
  }, [categories, query])

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.subtitle} />

      <AdminStatCard label={copy.count} value={formatNumber(categories.length, locale)} icon={Shapes} />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.2fr]">
        <AdminPanel title={copy.add}>
          <form onSubmit={handleAdd} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="category-name-ar" className="text-sm font-medium">{copy.nameAr}</label>
              <Input id="category-name-ar" value={newCategory.name_ar} onChange={(e) => setNewCategory({ ...newCategory, name_ar: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="category-name-en" className="text-sm font-medium">{copy.nameEn}</label>
              <Input id="category-name-en" value={newCategory.name_en} onChange={(e) => setNewCategory({ ...newCategory, name_en: e.target.value, slug: newCategory.slug || slugify(e.target.value) })} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="category-slug" className="text-sm font-medium">{copy.slug}</label>
              <Input id="category-slug" value={newCategory.slug} onChange={(e) => setNewCategory({ ...newCategory, slug: slugify(e.target.value) })} placeholder={copy.slugPlaceholder} />
              <p className="text-xs text-muted-foreground">{copy.slugHelp}</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="category-image-url" className="text-sm font-medium">{copy.cover}</label>
              <Input id="category-image-url" value={newCategory.image_url} onChange={(e) => setNewCategory({ ...newCategory, image_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="category-image-upload" className="text-sm font-medium">{copy.uploadCover}</label>
              <Input id="category-image-upload" type="file" accept="image/*" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(file) }} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="category-description-ar" className="text-sm font-medium">{copy.description}</label>
              <textarea id="category-description-ar" value={newCategory.description_ar} onChange={(e) => setNewCategory({ ...newCategory, description_ar: e.target.value })} className="min-h-[100px] w-full rounded-[20px] border border-input bg-background px-4 py-3 text-sm" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="category-gallery-images" className="text-sm font-medium">{copy.gallery}</label>
              <textarea id="category-gallery-images" value={newCategory.gallery_images} onChange={(e) => setNewCategory({ ...newCategory, gallery_images: e.target.value })} placeholder={copy.galleryPlaceholder} className="min-h-[110px] w-full rounded-[20px] border border-input bg-background px-4 py-3 text-sm" />
              <Input id="category-gallery-upload" type="file" accept="image/*" multiple disabled={uploading} onChange={(e) => { if (e.target.files?.length) handleGalleryUpload(e.target.files) }} />
            </div>
            <div className="md:col-span-2 flex items-center gap-4">
              <Button type="submit" disabled={submitting}>{submitting ? copy.adding : copy.add}</Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
            </div>
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
              {formatNumber(filteredCategories.length, locale)} / {formatNumber(categories.length, locale)}
            </div>
          </AdminToolbar>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-[24px]" />)}
            </div>
          ) : filteredCategories.length ? (
            <AdminPanel className="overflow-hidden" contentClassName="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className={`px-4 py-4 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{copy.nameAr}</th>
                      <th className={`px-4 py-4 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{copy.nameEn}</th>
                      <th className={`px-4 py-4 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{copy.slug}</th>
                      <th className={`px-4 py-4 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{copy.image}</th>
                      <th className={`px-4 py-4 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{copy.status}</th>
                      <th className={`px-4 py-4 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{copy.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((cat) => (
                      <tr key={cat.id} className="border-t border-border/70 hover:bg-muted/30">
                        <td className="px-4 py-4">{cat.name_ar}</td>
                        <td className="px-4 py-4">{cat.name_en}</td>
                        <td className="px-4 py-4 text-muted-foreground">{cat.slug}</td>
                        <td className="px-4 py-4 text-muted-foreground">{cat.image_url ? copy.added : '-'}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${cat.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {cat.is_active ? copy.active : copy.inactive}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" disabled={savingId === cat.id} onClick={() => toggleCategory(cat)}>
                              {cat.is_active ? copy.hide : copy.show}
                            </Button>
                            <Button size="sm" variant="destructive" disabled={savingId === cat.id} onClick={() => deleteCategory(cat.id)}>
                              {copy.delete}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminPanel>
          ) : (
            <AdminEmptyState title={copy.empty} description={copy.emptyDescription} />
          )}
        </div>
      </div>
    </div>
  )
}
