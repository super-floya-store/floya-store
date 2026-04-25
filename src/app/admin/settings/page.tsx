'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type AdminSettingsForm = {
  store_name_ar: string
  store_name_en: string
  store_description_ar: string
  store_phone: string
  store_whatsapp: string
  store_email: string
  store_address_ar: string
  delivery_fees: string
  logo_url: string
  hero_images: string
  baridimob_rip: string
  admin_notification_email: string
  email_sender_name: string
  email_sender_address: string
  order_confirmation_subject: string
  order_confirmation_html: string
  order_status_subject: string
  order_status_html: string
}

const defaultSettings: AdminSettingsForm = {
  store_name_ar: 'فلويا ستور',
  store_name_en: 'Floya Store',
  store_description_ar: '',
  store_phone: '0555123456',
  store_whatsapp: '213555123456',
  store_email: 'contact@floya.dz',
  store_address_ar: '',
  delivery_fees: '',
  logo_url: '',
  hero_images: '',
  baridimob_rip: '00799999004419717033',
  admin_notification_email: 'contact@floya.dz',
  email_sender_name: 'Floya Store',
  email_sender_address: 'onboarding@resend.dev',
  order_confirmation_subject: 'تأكيد طلبك {{order_number}}',
  order_confirmation_html: '<div dir="rtl"><h2>شكراً لك {{customer_name}}</h2><p>تم استلام طلبك {{order_number}}</p></div>',
  order_status_subject: 'تحديث حالة الطلب {{order_number}}',
  order_status_html: '<div dir="rtl"><p>تم تحديث حالة طلبك {{order_number}} إلى {{order_status}}</p></div>',
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettingsForm>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const parseDeliveryFees = (value: string) => {
    if (!value.trim()) return {}
    try {
      const parsed = JSON.parse(value)
      return typeof parsed === 'object' && parsed && !Array.isArray(parsed) ? parsed : {}
    } catch {
      throw new Error('رسوم التوصيل يجب أن تكون JSON صحيحاً')
    }
  }

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings')
        const data = await res.json()

        if (!data.success) {
          throw new Error(data.error?.message || 'تعذر تحميل الإعدادات')
        }

        setSettings({
          store_name_ar: data.data?.store_name?.ar || defaultSettings.store_name_ar,
          store_name_en: data.data?.store_name?.en || defaultSettings.store_name_en,
          store_description_ar: data.data?.store_description?.ar || defaultSettings.store_description_ar,
          store_phone: data.data?.store_phone || defaultSettings.store_phone,
          store_whatsapp: data.data?.store_whatsapp || defaultSettings.store_whatsapp,
          store_email: data.data?.store_email || defaultSettings.store_email,
          store_address_ar: data.data?.store_address?.ar || defaultSettings.store_address_ar,
          delivery_fees: data.data?.delivery_fees ? JSON.stringify(data.data.delivery_fees, null, 2) : defaultSettings.delivery_fees,
          logo_url: data.data?.logo_url || defaultSettings.logo_url,
          hero_images: Array.isArray(data.data?.hero_images) ? data.data.hero_images.join('\n') : defaultSettings.hero_images,
          baridimob_rip: data.data?.baridimob_rip || defaultSettings.baridimob_rip,
          admin_notification_email: data.data?.admin_notification_email || data.data?.store_email || defaultSettings.admin_notification_email,
          email_sender_name: data.data?.email_sender_name || defaultSettings.email_sender_name,
          email_sender_address: data.data?.email_sender_address || defaultSettings.email_sender_address,
          order_confirmation_subject: data.data?.email_templates?.order_confirmation?.subject || defaultSettings.order_confirmation_subject,
          order_confirmation_html: data.data?.email_templates?.order_confirmation?.html || defaultSettings.order_confirmation_html,
          order_status_subject: data.data?.email_templates?.order_status_update?.subject || defaultSettings.order_status_subject,
          order_status_html: data.data?.email_templates?.order_status_update?.html || defaultSettings.order_status_html,
        })
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'تعذر تحميل الإعدادات')
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const parsedDeliveryFees = parseDeliveryFees(settings.delivery_fees)
      const payload = {
        store_name: {
          ar: settings.store_name_ar,
          en: settings.store_name_en,
        },
        store_description: {
          ar: settings.store_description_ar,
          en: '',
        },
        store_phone: settings.store_phone,
        store_whatsapp: settings.store_whatsapp,
        store_email: settings.store_email,
        store_address: {
          ar: settings.store_address_ar,
          en: '',
        },
        delivery_fees: parsedDeliveryFees,
        logo_url: settings.logo_url,
        hero_images: settings.hero_images.split('\n').map((item) => item.trim()).filter(Boolean),
        baridimob_rip: settings.baridimob_rip,
        admin_notification_email: settings.admin_notification_email,
        email_sender_name: settings.email_sender_name,
        email_sender_address: settings.email_sender_address,
        order_email_enabled: true,
        email_templates: {
          order_confirmation: {
            subject: settings.order_confirmation_subject,
            html: settings.order_confirmation_html,
          },
          order_status_update: {
            subject: settings.order_status_subject,
            html: settings.order_status_html,
          },
        },
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error?.message || 'تعذر حفظ الإعدادات')
      }

      setMessage('تم حفظ الإعدادات بنجاح')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'تعذر حفظ الإعدادات')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-3xl font-bold">إعدادات المتجر</h1>
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إعدادات المتجر</h1>
        <p className="text-sm text-muted-foreground mt-1">تحديث اسم المتجر وبيانات التواصل المستخدمة في الواجهة.</p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>معلومات المتجر</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name-ar">اسم المتجر (عربي)</Label>
              <Input id="store-name-ar" value={settings.store_name_ar} onChange={(e) => setSettings({ ...settings, store_name_ar: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-name-en">اسم المتجر (إنجليزي)</Label>
              <Input id="store-name-en" value={settings.store_name_en} onChange={(e) => setSettings({ ...settings, store_name_en: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-phone">هاتف التواصل</Label>
              <Input id="store-phone" value={settings.store_phone} onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-description-ar">وصف المتجر</Label>
              <textarea id="store-description-ar" value={settings.store_description_ar} onChange={(e) => setSettings({ ...settings, store_description_ar: e.target.value })} className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-whatsapp">واتساب</Label>
              <Input id="store-whatsapp" value={settings.store_whatsapp} onChange={(e) => setSettings({ ...settings, store_whatsapp: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-email">البريد الإلكتروني</Label>
              <Input id="store-email" type="email" value={settings.store_email} onChange={(e) => setSettings({ ...settings, store_email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-address-ar">العنوان</Label>
              <Input id="store-address-ar" value={settings.store_address_ar} onChange={(e) => setSettings({ ...settings, store_address_ar: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-fees">رسوم التوصيل حسب الولاية</Label>
              <textarea id="delivery-fees" value={settings.delivery_fees} onChange={(e) => setSettings({ ...settings, delivery_fees: e.target.value })} className="min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder='{"الجزائر": 500, "وهران": 700}' />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baridimob-rip">RIP باريدي موب</Label>
              <Input id="baridimob-rip" value={settings.baridimob_rip} onChange={(e) => setSettings({ ...settings, baridimob_rip: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo-url">رابط الشعار</Label>
              <Input id="logo-url" value={settings.logo_url} onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-images">صور الواجهة</Label>
              <textarea id="hero-images" value={settings.hero_images} onChange={(e) => setSettings({ ...settings, hero_images: e.target.value })} className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="رابط صورة في كل سطر" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إعدادات الإشعارات والبريد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-notification-email">بريد الإدارة للإشعارات</Label>
              <Input id="admin-notification-email" type="email" value={settings.admin_notification_email} onChange={(e) => setSettings({ ...settings, admin_notification_email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-sender-name">اسم المرسل</Label>
              <Input id="email-sender-name" value={settings.email_sender_name} onChange={(e) => setSettings({ ...settings, email_sender_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-sender-address">بريد المرسل</Label>
              <Input id="email-sender-address" value={settings.email_sender_address} onChange={(e) => setSettings({ ...settings, email_sender_address: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-confirmation-subject">عنوان رسالة تأكيد الطلب</Label>
              <Input id="order-confirmation-subject" value={settings.order_confirmation_subject} onChange={(e) => setSettings({ ...settings, order_confirmation_subject: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-confirmation-html">قالب رسالة تأكيد الطلب</Label>
              <textarea id="order-confirmation-html" value={settings.order_confirmation_html} onChange={(e) => setSettings({ ...settings, order_confirmation_html: e.target.value })} className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-status-subject">عنوان رسالة تحديث الحالة</Label>
              <Input id="order-status-subject" value={settings.order_status_subject} onChange={(e) => setSettings({ ...settings, order_status_subject: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-status-html">قالب رسالة تحديث الحالة</Label>
              <textarea id="order-status-html" value={settings.order_status_html} onChange={(e) => setSettings({ ...settings, order_status_html: e.target.value })} className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}
        </div>
      </form>
    </div>
  )
}
