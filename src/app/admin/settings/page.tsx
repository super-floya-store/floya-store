'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useUIStore } from '@/stores/ui-store'

type AdminSettingsForm = {
  store_name_ar: string
  store_name_en: string
  store_description_ar: string
  store_phone: string
  store_whatsapp: string
  store_email: string
  store_address_ar: string
  store_address_en: string
  delivery_fees: string
  logo_url: string
  favicon_url: string
  hero_images: string
  baridimob_rip: string
  binance_wallet_address: string
  payment_methods: {
    baridimob: boolean
    cod: boolean
    binance: boolean
  }
  admin_notification_email: string
  email_sender_name: string
  email_sender_address: string
}

const defaultSettings: AdminSettingsForm = {
  store_name_ar: 'فلويا ستور',
  store_name_en: 'Floya Store',
  store_description_ar: '',
  store_phone: '0555123456',
  store_whatsapp: '213555123456',
  store_email: 'contact@floya.dz',
  store_address_ar: '',
  store_address_en: '',
  delivery_fees: '',
  logo_url: '',
  favicon_url: '',
  hero_images: '',
  baridimob_rip: '00799999004419717033',
  binance_wallet_address: '',
  payment_methods: {
    baridimob: true,
    cod: true,
    binance: false,
  },
  admin_notification_email: 'contact@floya.dz',
  email_sender_name: 'Floya Store',
  email_sender_address: 'onboarding@resend.dev',
}

export default function AdminSettingsPage() {
  const locale = useUIStore((state) => state.locale)
  const [settings, setSettings] = useState<AdminSettingsForm>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const copy = locale === 'ar'
    ? {
        title: 'إعدادات المتجر',
        subtitle: 'تحديث الاسم، الهوية البصرية، معلومات التواصل، ومرسل رسائل الاسترجاع.',
        storeInfo: 'معلومات المتجر',
        storeNameAr: 'اسم المتجر (عربي)',
        storeNameEn: 'اسم المتجر (إنجليزي)',
        storePhone: 'هاتف التواصل',
        storeDescriptionAr: 'وصف المتجر',
        storeWhatsapp: 'واتساب',
        storeEmail: 'البريد الإلكتروني',
        storeAddressAr: 'العنوان',
        storeAddressEn: 'العنوان (إنجليزي)',
        deliveryFees: 'رسوم التوصيل حسب الولاية',
        branding: 'الهوية البصرية',
        logoUrl: 'رابط الشعار',
        faviconUrl: 'رابط أيقونة التبويب',
        logoHelp: 'يفضل شعار مربع واضح. المقاس المقترح 512×512.',
        faviconHelp: 'يفضل أيقونة صغيرة مربعة. المقاس المقترح 32×32 أو 64×64.',
        currentPreview: 'المعاينة الحالية',
        heroImages: 'صور الواجهة',
        heroHelp: 'ضع رابط صورة في كل سطر.',
        payments: 'الدفع',
        baridimobRip: 'RIP باريدي موب',
        binanceWallet: 'عنوان محفظة Binance / USDT',
        paymentMethods: 'طرق الدفع المتاحة',
        cashOnDelivery: 'الدفع عند الاستلام',
        notifications: 'الإشعارات والبريد',
        adminNotificationEmail: 'بريد الإدارة للإشعارات',
        emailSenderName: 'اسم المرسل',
        emailSenderAddress: 'بريد المرسل',
        resetOnlyNotice: 'رسائل البريد للعملاء مخصصة الآن لاسترجاع كلمة المرور فقط. رسائل تأكيد الطلب وتحديث الحالة متوقفة.',
        save: 'حفظ الإعدادات',
        saving: 'جاري الحفظ...',
        saved: 'تم حفظ الإعدادات بنجاح',
        invalidResponse: 'استجابة غير صالحة من الخادم',
        deliveryJsonError: 'رسوم التوصيل يجب أن تكون JSON صحيحاً',
      }
    : {
        title: 'Store settings',
        subtitle: 'Update the store name, visual branding, contact details, and password-reset sender identity.',
        storeInfo: 'Store information',
        storeNameAr: 'Store name (Arabic)',
        storeNameEn: 'Store name (English)',
        storePhone: 'Contact phone',
        storeDescriptionAr: 'Store description',
        storeWhatsapp: 'WhatsApp',
        storeEmail: 'Email',
        storeAddressAr: 'Address',
        storeAddressEn: 'Address (English)',
        deliveryFees: 'Delivery fees by wilaya',
        branding: 'Branding',
        logoUrl: 'Logo URL',
        faviconUrl: 'Tab icon URL',
        logoHelp: 'Use a clear square logo. Recommended size: 512x512.',
        faviconHelp: 'Use a small square icon. Recommended size: 32x32 or 64x64.',
        currentPreview: 'Current preview',
        heroImages: 'Hero images',
        heroHelp: 'Add one image URL per line.',
        payments: 'Payments',
        baridimobRip: 'BaridiMob RIP',
        binanceWallet: 'Binance / USDT wallet address',
        paymentMethods: 'Available payment methods',
        cashOnDelivery: 'Cash on delivery',
        notifications: 'Notifications and email',
        adminNotificationEmail: 'Admin notification email',
        emailSenderName: 'Sender name',
        emailSenderAddress: 'Sender email',
        resetOnlyNotice: 'Customer email is now reserved for password resets only. Order confirmation and status emails are disabled.',
        save: 'Save settings',
        saving: 'Saving...',
        saved: 'Settings saved successfully',
        invalidResponse: 'Invalid server response',
        deliveryJsonError: 'Delivery fees must be valid JSON',
      }

  const parseApiResponse = async (res: Response) => {
    const text = await res.text()
    if (!text.trim()) return null
    try {
      return JSON.parse(text)
    } catch {
      throw new Error(`${copy.invalidResponse} (${res.status})`)
    }
  }

  const parseDeliveryFees = (value: string) => {
    if (!value.trim()) return {}
    try {
      const parsed = JSON.parse(value)
      return typeof parsed === 'object' && parsed && !Array.isArray(parsed) ? parsed : {}
    } catch {
      throw new Error(copy.deliveryJsonError)
    }
  }

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings')
        const data = await res.json()

        if (!data.success) {
          throw new Error(data.error?.message || 'Failed to load settings')
        }

        setSettings({
          store_name_ar: data.data?.store_name?.ar || defaultSettings.store_name_ar,
          store_name_en: data.data?.store_name?.en || defaultSettings.store_name_en,
          store_description_ar: data.data?.store_description?.ar || defaultSettings.store_description_ar,
          store_phone: data.data?.store_phone || defaultSettings.store_phone,
          store_whatsapp: data.data?.store_whatsapp || defaultSettings.store_whatsapp,
          store_email: data.data?.store_email || defaultSettings.store_email,
          store_address_ar: data.data?.store_address?.ar || defaultSettings.store_address_ar,
          store_address_en: data.data?.store_address?.en || defaultSettings.store_address_en,
          delivery_fees: data.data?.delivery_fees ? JSON.stringify(data.data.delivery_fees, null, 2) : defaultSettings.delivery_fees,
          logo_url: data.data?.logo_url || defaultSettings.logo_url,
          favicon_url: data.data?.favicon_url || defaultSettings.favicon_url,
          hero_images: Array.isArray(data.data?.hero_images) ? data.data.hero_images.join('\n') : defaultSettings.hero_images,
          baridimob_rip: data.data?.baridimob_rip || defaultSettings.baridimob_rip,
          binance_wallet_address: data.data?.binance_wallet_address || defaultSettings.binance_wallet_address,
          payment_methods: data.data?.payment_methods || defaultSettings.payment_methods,
          admin_notification_email: data.data?.admin_notification_email || data.data?.store_email || defaultSettings.admin_notification_email,
          email_sender_name: data.data?.email_sender_name || defaultSettings.email_sender_name,
          email_sender_address: data.data?.email_sender_address || defaultSettings.email_sender_address,
        })
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load settings')
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
        store_name: { ar: settings.store_name_ar, en: settings.store_name_en },
        store_description: { ar: settings.store_description_ar, en: '' },
        store_phone: settings.store_phone,
        store_whatsapp: settings.store_whatsapp,
        store_email: settings.store_email,
        store_address: { ar: settings.store_address_ar, en: settings.store_address_en },
        delivery_fees: parsedDeliveryFees,
        logo_url: settings.logo_url,
        favicon_url: settings.favicon_url,
        hero_images: settings.hero_images.split('\n').map((item) => item.trim()).filter(Boolean),
        baridimob_rip: settings.baridimob_rip,
        binance_wallet_address: settings.binance_wallet_address,
        payment_methods: settings.payment_methods,
        admin_notification_email: settings.admin_notification_email,
        email_sender_name: settings.email_sender_name,
        email_sender_address: settings.email_sender_address,
        order_email_enabled: false,
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await parseApiResponse(res)
      if (!res.ok || !data?.success) {
        throw new Error(data?.error?.message || `Failed to save settings (${res.status})`)
      }

      setSettings((current) => ({
        ...current,
        store_name_ar: data.data?.store_name?.ar || current.store_name_ar,
        store_name_en: data.data?.store_name?.en || current.store_name_en,
        logo_url: data.data?.logo_url || current.logo_url,
        favicon_url: data.data?.favicon_url || current.favicon_url,
      }))
      window.dispatchEvent(new CustomEvent('store-branding-updated', { detail: data.data }))
      setMessage(copy.saved)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-3xl font-bold">{copy.title}</h1>
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{copy.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{copy.storeInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name-ar">{copy.storeNameAr}</Label>
              <Input id="store-name-ar" value={settings.store_name_ar} onChange={(e) => setSettings({ ...settings, store_name_ar: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-name-en">{copy.storeNameEn}</Label>
              <Input id="store-name-en" value={settings.store_name_en} onChange={(e) => setSettings({ ...settings, store_name_en: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-phone">{copy.storePhone}</Label>
              <Input id="store-phone" value={settings.store_phone} onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-description-ar">{copy.storeDescriptionAr}</Label>
              <textarea id="store-description-ar" value={settings.store_description_ar} onChange={(e) => setSettings({ ...settings, store_description_ar: e.target.value })} className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-whatsapp">{copy.storeWhatsapp}</Label>
              <Input id="store-whatsapp" value={settings.store_whatsapp} onChange={(e) => setSettings({ ...settings, store_whatsapp: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-email">{copy.storeEmail}</Label>
              <Input id="store-email" type="email" value={settings.store_email} onChange={(e) => setSettings({ ...settings, store_email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-address-ar">{copy.storeAddressAr}</Label>
              <Input id="store-address-ar" value={settings.store_address_ar} onChange={(e) => setSettings({ ...settings, store_address_ar: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-address-en">{copy.storeAddressEn}</Label>
              <Input id="store-address-en" value={settings.store_address_en} onChange={(e) => setSettings({ ...settings, store_address_en: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-fees">{copy.deliveryFees}</Label>
              <textarea id="delivery-fees" value={settings.delivery_fees} onChange={(e) => setSettings({ ...settings, delivery_fees: e.target.value })} className="min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder='{"الجزائر": 500, "وهران": 700}' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{copy.branding}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo-url">{copy.logoUrl}</Label>
              <Input id="logo-url" value={settings.logo_url} onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })} />
              <p className="text-xs text-muted-foreground">{copy.logoHelp}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="favicon-url">{copy.faviconUrl}</Label>
              <Input id="favicon-url" value={settings.favicon_url} onChange={(e) => setSettings({ ...settings, favicon_url: e.target.value })} />
              <p className="text-xs text-muted-foreground">{copy.faviconHelp}</p>
            </div>
            {settings.logo_url || settings.favicon_url ? (
              <div className="flex flex-wrap items-center gap-6 rounded-md border border-input p-3">
                {settings.logo_url ? (
                  <div className="flex items-center gap-3">
                    <Image src={settings.logo_url} alt="Logo preview" width={48} height={48} className="rounded-md object-cover" />
                    <span className="text-sm text-muted-foreground">{copy.currentPreview}</span>
                  </div>
                ) : null}
                {settings.favicon_url ? (
                  <div className="flex items-center gap-3">
                    <Image src={settings.favicon_url} alt="Favicon preview" width={24} height={24} className="rounded-md object-cover" />
                    <span className="text-sm text-muted-foreground">Favicon</span>
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="hero-images">{copy.heroImages}</Label>
              <textarea id="hero-images" value={settings.hero_images} onChange={(e) => setSettings({ ...settings, hero_images: e.target.value })} className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder={copy.heroHelp} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{copy.payments}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="baridimob-rip">{copy.baridimobRip}</Label>
              <Input id="baridimob-rip" value={settings.baridimob_rip} onChange={(e) => setSettings({ ...settings, baridimob_rip: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="binance-wallet-address">{copy.binanceWallet}</Label>
              <Input id="binance-wallet-address" value={settings.binance_wallet_address} onChange={(e) => setSettings({ ...settings, binance_wallet_address: e.target.value })} />
            </div>
            <div className="space-y-3">
              <Label>{copy.paymentMethods}</Label>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { key: 'baridimob', label: 'BaridiMob' },
                  { key: 'cod', label: copy.cashOnDelivery },
                  { key: 'binance', label: 'Binance / USDT' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={settings.payment_methods[item.key as keyof AdminSettingsForm['payment_methods']]}
                      onChange={(e) => setSettings({
                        ...settings,
                        payment_methods: {
                          ...settings.payment_methods,
                          [item.key]: e.target.checked,
                        },
                      })}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{copy.notifications}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900">
              {copy.resetOnlyNotice}
            </p>
            <div className="space-y-2">
              <Label htmlFor="admin-notification-email">{copy.adminNotificationEmail}</Label>
              <Input id="admin-notification-email" type="email" value={settings.admin_notification_email} onChange={(e) => setSettings({ ...settings, admin_notification_email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-sender-name">{copy.emailSenderName}</Label>
              <Input id="email-sender-name" value={settings.email_sender_name} onChange={(e) => setSettings({ ...settings, email_sender_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-sender-address">{copy.emailSenderAddress}</Label>
              <Input id="email-sender-address" value={settings.email_sender_address} onChange={(e) => setSettings({ ...settings, email_sender_address: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving}>{saving ? copy.saving : copy.save}</Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? <p className="text-sm text-green-600">{message}</p> : null}
        </div>
      </form>
    </div>
  )
}
