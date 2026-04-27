'use client'

import { useEffect, useState } from 'react'
import { useStoreBranding } from '@/hooks/useStoreBranding'
import { useUIStore } from '@/stores/ui-store'

export function BrandingSync() {
  const locale = useUIStore((state) => state.locale)
  const branding = useStoreBranding()
  const [faviconUrl, setFaviconUrl] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadFavicon = async () => {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' })
        const data = await res.json()
        if (isMounted && data?.success) {
          setFaviconUrl(data.data?.favicon_url || data.data?.logo_url || '/branding/floya-favicon.svg')
        }
      } catch {
        if (isMounted) {
          setFaviconUrl('/branding/floya-favicon.svg')
        }
      }
    }

    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent
      const nextSettings = customEvent.detail

      if (nextSettings) {
        setFaviconUrl(nextSettings.favicon_url || nextSettings.logo_url || '/branding/floya-favicon.svg')
        return
      }

      loadFavicon()
    }

    loadFavicon()
    window.addEventListener('store-branding-updated', handleUpdate as EventListener)

    return () => {
      isMounted = false
      window.removeEventListener('store-branding-updated', handleUpdate as EventListener)
    }
  }, [])

  useEffect(() => {
    const title = locale === 'ar' ? branding.nameAr : branding.nameEn
    document.title = title

    const iconUrl = faviconUrl || branding.logoUrl
    if (!iconUrl) return

    let icon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null
    if (!icon) {
      icon = document.createElement('link')
      icon.rel = 'icon'
      document.head.appendChild(icon)
    }
    icon.href = iconUrl
  }, [branding, faviconUrl, locale])

  return null
}
