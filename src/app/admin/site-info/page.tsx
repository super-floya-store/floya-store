'use client'

import { useCallback, useEffect, useState } from 'react'
import { Building2, Mail, MessageCircle, Phone, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useUIStore } from '@/stores/ui-store'
import { AdminPageHeader, AdminPanel } from '@/components/admin/AdminShell'

type SiteInfoForm = {
  store_name_ar: string
  store_name_en: string
  store_phone: string
  store_whatsapp: string
  store_email: string
  admin_notification_email: string
}

const defaultForm: SiteInfoForm = {
  store_name_ar: 'فلويا ستور',
  store_name_en: 'Floya Store',
  store_phone: '',
  store_whatsapp: '',
  store_email: '',
  admin_notification_email: '',
}

export default function AdminSiteInfoPage() {
  const locale = useUIStore((state) => state.locale)
  const [form, setForm] = useState<SiteInfoForm>(defaultForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const copy = locale === 'ar'
    ? {
        eyebrow: 'هوية المتجر',
        title: 'معلومات المتجر',
        subtitle: 'غيّر اسم المتجر وبيانات التواصل الأساسية من مكان واحد.',
        save: 'حفظ المعلومات',
        saving: 'جاري الحفظ...',
        saved: 'تم حفظ معلومات المتجر بنجاح',
        invalid: 'استجابة غير صالحة من الخادم',
        loadFailed: 'تعذر تحميل معلومات المتجر',
        saveFailed: 'تعذر حفظ معلومات المتجر',
        storeNameAr: 'اسم المتجر (عربي)',
        storeNameEn: 'اسم المتجر (إنجليزي)',
        phone: 'رقم الهاتف',
        whatsapp: 'رقم واتساب',
        storeEmail: 'البريد الظاهر في الموقع',
        contactEmail: 'بريد تواصل الإدارة',
      }
    : {
        eyebrow: 'Store identity',
        title: 'Store Info',
        subtitle: 'Change the store name and core contact details from one focused page.',
        save: 'Save info',
        saving: 'Saving...',
        saved: 'Store info saved successfully',
        invalid: 'Invalid server response',
        loadFailed: 'Failed to load store info',
        saveFailed: 'Failed to save store info',
        storeNameAr: 'Store name (Arabic)',
        storeNameEn: 'Store name (English)',
        phone: 'Phone number',
        whatsapp: 'WhatsApp number',
        storeEmail: 'Public store email',
        contactEmail: 'Admin contact email',
      }

  const parseResponse = useCallback(async (res: Response) => {
    const text = await res.text()
    if (!text.trim()) return null
    try {
      return JSON.parse(text)
    } catch {
      throw new Error(copy.invalid)
    }
  }, [copy.invalid])

  const request = useCallback(async (method: 'GET' | 'PUT', body?: Record<string, unknown>) => {
    const tokenEntry = typeof document === 'undefined'
      ? ''
      : document.cookie.split('; ').find((item) => item.startsWith('access_token='))
    const token = tokenEntry ? decodeURIComponent(tokenEntry.split('=').slice(1).join('=')) : ''

    return fetch('/api/admin/store-info', {
      method,
      credentials: 'include',
      cache: 'no-store',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
  }, [])

  useEffect(() => {
    async function load() {
      try {
        let res = await request('GET')
        if (res.status === 401) {
          const refreshRes = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
          if (refreshRes.ok) {
            res = await request('GET')
          }
        }

        const data = await parseResponse(res)
        if (!res.ok || !data?.success) {
          throw new Error(data?.error?.message || `${copy.loadFailed} (${res.status})`)
        }

        setForm({
          store_name_ar: data.data?.store_name?.ar || defaultForm.store_name_ar,
          store_name_en: data.data?.store_name?.en || defaultForm.store_name_en,
          store_phone: data.data?.store_phone || defaultForm.store_phone,
          store_whatsapp: data.data?.store_whatsapp || defaultForm.store_whatsapp,
          store_email: data.data?.store_email || defaultForm.store_email,
          admin_notification_email: data.data?.admin_notification_email || data.data?.store_email || defaultForm.admin_notification_email,
        })
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : copy.loadFailed)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [copy.loadFailed, parseResponse, request])

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    const payload = {
      store_name: {
        ar: form.store_name_ar,
        en: form.store_name_en,
      },
      store_phone: form.store_phone,
      store_whatsapp: form.store_whatsapp,
      store_email: form.store_email,
      admin_notification_email: form.admin_notification_email,
    }

    try {
      let res = await request('PUT', payload)
      if (res.status === 401) {
        const refreshRes = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
        if (refreshRes.ok) {
          res = await request('PUT', payload)
        }
      }

      const data = await parseResponse(res)
      if (!res.ok || !data?.success) {
        throw new Error(data?.error?.message || `${copy.saveFailed} (${res.status})`)
      }

      const nextDetail = {
        ...data.data,
        store_name: data.data?.store_name || payload.store_name,
        store_phone: data.data?.store_phone || payload.store_phone,
        store_whatsapp: data.data?.store_whatsapp || payload.store_whatsapp,
        store_email: data.data?.store_email || payload.store_email,
        admin_notification_email: data.data?.admin_notification_email || payload.admin_notification_email,
      }

      window.dispatchEvent(new CustomEvent('store-branding-updated', { detail: nextDetail }))
      window.dispatchEvent(new CustomEvent('store-settings-updated', { detail: nextDetail }))
      setMessage(copy.saved)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : copy.saveFailed)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-[28px]" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      <AdminPageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.subtitle} />

      <form onSubmit={handleSave} className="space-y-5">
        <AdminPanel title={copy.title}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="store-name-ar">{copy.storeNameAr}</Label>
              <Input id="store-name-ar" value={form.store_name_ar} onChange={(e) => setForm({ ...form, store_name_ar: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-name-en">{copy.storeNameEn}</Label>
              <Input id="store-name-en" value={form.store_name_en} onChange={(e) => setForm({ ...form, store_name_en: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-phone">{copy.phone}</Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="store-phone" className="pl-9" value={form.store_phone} onChange={(e) => setForm({ ...form, store_phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-whatsapp">{copy.whatsapp}</Label>
              <div className="relative">
                <MessageCircle className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="store-whatsapp" className="pl-9" value={form.store_whatsapp} onChange={(e) => setForm({ ...form, store_whatsapp: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-email">{copy.storeEmail}</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="store-email" type="email" className="pl-9" value={form.store_email} onChange={(e) => setForm({ ...form, store_email: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">{copy.contactEmail}</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="contact-email" type="email" className="pl-9" value={form.admin_notification_email} onChange={(e) => setForm({ ...form, admin_notification_email: e.target.value })} />
              </div>
            </div>
          </div>
        </AdminPanel>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving} className="min-h-[46px] rounded-full px-5">
            <Save className="mr-2 h-4 w-4" />
            {saving ? copy.saving : copy.save}
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? <p className="text-sm text-green-600">{message}</p> : null}
        </div>
      </form>
    </div>
  )
}
