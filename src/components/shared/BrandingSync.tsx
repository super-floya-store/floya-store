'use client'

import { useEffect } from 'react'
import { useStoreBranding } from '@/hooks/useStoreBranding'
import { useUIStore } from '@/stores/ui-store'

export function BrandingSync() {
  const locale = useUIStore((state) => state.locale)
  const branding = useStoreBranding()

  useEffect(() => {
    const title = locale === 'ar' ? branding.nameAr : branding.nameEn
    document.title = title

    if (!branding.logoUrl) return

    let icon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null
    if (!icon) {
      icon = document.createElement('link')
      icon.rel = 'icon'
      document.head.appendChild(icon)
    }
    icon.href = branding.logoUrl
  }, [branding, locale])

  return null
}
