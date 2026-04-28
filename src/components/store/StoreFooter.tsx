'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, Instagram, ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useUIStore } from '@/stores/ui-store'
import { useStoreBranding } from '@/hooks/useStoreBranding'

interface Settings {
  store_phone?: string
  store_whatsapp?: string
  store_email?: string
  store_address?: string
  social_links?: string
}

export function StoreFooter() {
  const locale = useUIStore((state) => state.locale)
  const branding = useStoreBranding()
  const [settings, setSettings] = useState<Settings>({})

  useEffect(() => {
    let isMounted = true

    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' })
        const data = await res.json()
        if (isMounted && data.success) {
          setSettings(data.data)
        }
      } catch {}
    }

    const handleSettingsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<Settings>
      if (customEvent.detail) {
        setSettings(customEvent.detail)
        return
      }

      void loadSettings()
    }

    void loadSettings()
    window.addEventListener('store-settings-updated', handleSettingsUpdate as EventListener)

    return () => {
      isMounted = false
      window.removeEventListener('store-settings-updated', handleSettingsUpdate as EventListener)
    }
  }, [])

  const socialLinks = typeof settings.social_links === 'string' ? JSON.parse(settings.social_links) : (settings.social_links || {})
  const address = typeof settings.store_address === 'string' ? JSON.parse(settings.store_address) : (settings.store_address || { ar: 'تيزي وزو' })
  const copy = locale === 'ar'
    ? {
        kicker: 'متجر فلويا',
        body: 'تسوق واضح وسريع بتجربة أنيقة على الهاتف وسطح المكتب.',
        fastTitle: 'خدمة سريعة',
        fastBody: 'استفسارات أسرع وردود أوضح.',
        whatsapp: 'تواصل عبر واتساب',
        quickLinks: 'روابط سريعة',
        links: [
          { href: '/products', label: 'جميع المنتجات' },
          { href: '/search', label: 'البحث' },
          { href: '/contact', label: 'تواصل معنا' },
        ],
        contact: 'تواصل معنا',
        top: 'العودة إلى الأعلى',
        rights: `© 2026 ${branding.nameAr}. جميع الحقوق محفوظة.`,
      }
    : {
        kicker: 'FLOYA STORE',
        body: 'Clean shopping, faster browsing, and a more polished storefront.',
        fastTitle: 'Fast support',
        fastBody: 'Quick questions and clearer answers.',
        whatsapp: 'Chat on WhatsApp',
        quickLinks: 'Quick links',
        links: [
          { href: '/products', label: 'All products' },
          { href: '/search', label: 'Search' },
          { href: '/contact', label: 'Contact us' },
        ],
        contact: 'Contact us',
        top: 'Back to top',
        rights: `© 2026 ${branding.nameEn}. All rights reserved.`,
      }

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-footer-gradient text-secondary-foreground">
      <div className="absolute inset-0 bg-hero-radial opacity-80" />
      <div className="absolute left-[-7rem] top-12 size-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 right-[-5rem] size-52 rounded-full bg-white/10 blur-3xl" />

      <div className="container relative mx-auto px-4 py-6 md:px-6 lg:py-7">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.7fr_1fr] lg:items-start">
          <div className="flex flex-col gap-3">
            <span className="section-kicker w-fit border-white/10 bg-white/10 text-primary-foreground">{copy.kicker}</span>
            <div>
              <h3 className="text-xl font-bold md:text-2xl">{locale === 'ar' ? branding.nameAr : branding.nameEn}</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-secondary-foreground/88">
                {copy.body}
              </p>
            </div>
            <div className="surface-card flex max-w-lg flex-col gap-2 rounded-[20px] border-white/10 bg-white/10 p-3 text-sm text-secondary sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.2em] text-primary">{copy.fastTitle}</p>
                <p className="mt-1 text-sm font-semibold text-secondary-foreground">{copy.fastBody}</p>
              </div>
              <a
                href={`https://wa.me/${settings.store_whatsapp || '213555123456'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[38px] items-center justify-center rounded-full bg-primary px-3.5 py-2 text-sm font-bold text-primary-foreground transition duration-300 hover:-translate-y-0.5 hover:shadow-glow"
              >
                {copy.whatsapp}
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-base font-bold">{copy.quickLinks}</h3>
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <div className="flex flex-col gap-2 text-sm">
              {copy.links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group inline-flex min-h-[36px] items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2 transition duration-300 hover:border-primary/40 hover:bg-white/10"
                >
                  <span>{item.label}</span>
                  <span className="text-primary transition duration-300 group-hover:-translate-x-1">{locale === 'ar' ? '←' : '→'}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-base font-bold">{copy.contact}</h3>
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <div className="grid gap-2 text-sm sm:grid-cols-3">
              <div className="surface-card flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-[18px] border-white/10 bg-white/10 px-3 py-3 text-center">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold tracking-[0.2em] text-primary">{locale === 'ar' ? 'الهاتف' : 'Phone'}</span>
                <span className="text-sm font-semibold text-secondary-foreground">{settings.store_phone || '0555123456'}</span>
              </div>
              <div className="surface-card flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-[18px] border-white/10 bg-white/10 px-3 py-3 text-center">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold tracking-[0.2em] text-primary">{locale === 'ar' ? 'البريد' : 'Email'}</span>
                <span className="text-sm font-semibold text-secondary-foreground">{settings.store_email || 'contact@floya.dz'}</span>
              </div>
              <div className="surface-card flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-[18px] border-white/10 bg-white/10 px-3 py-3 text-center">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold tracking-[0.2em] text-primary">{locale === 'ar' ? 'الموقع' : 'Location'}</span>
                <span className="text-sm font-semibold text-secondary-foreground">{locale === 'ar' ? (address?.ar || 'تيزي وزو') : (address?.en || 'Algeria')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[42px] min-w-[42px] items-center justify-center rounded-full border border-white/10 bg-white/10 transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-primary hover:text-primary-foreground"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[42px] min-w-[42px] items-center justify-center rounded-full border border-white/10 bg-white/10 transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-primary hover:text-primary-foreground"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {socialLinks.tiktok && (
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[42px] min-w-[42px] items-center justify-center rounded-full border border-white/10 bg-white/10 transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-primary hover:text-primary-foreground"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.87 2.87 0 0 1 1.12.23V9.4a6.33 6.33 0 0 0-1.12-.1A6.26 6.26 0 0 0 4.22 15.5a6.26 6.26 0 0 0 6.25 6.25 6.26 6.26 0 0 0 6.25-6.25V9.01a8.16 8.16 0 0 0 4.78 1.53V7.16a4.83 4.83 0 0 1-1.91-.47z"/></svg>
                </a>
              )}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="ml-auto inline-flex min-h-[42px] min-w-[42px] items-center justify-center rounded-full bg-white/10 text-secondary-foreground transition duration-300 hover:-translate-y-1 hover:bg-primary hover:text-primary-foreground"
                aria-label={copy.top}
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-1.5 border-t border-white/10 pt-3 text-center text-xs text-secondary-foreground/78 md:flex-row md:items-center md:justify-between">
          <p>{copy.rights}</p>
          <p>{locale === 'ar' ? (address?.ar || 'الجزائر') : (address?.en || 'Algeria')} • {settings.store_email || 'contact@floya.dz'}</p>
        </div>
      </div>
    </footer>
  )
}
