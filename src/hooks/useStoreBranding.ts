'use client'

import { useEffect, useState } from 'react'

type BrandingState = {
  nameAr: string
  nameEn: string
  logoUrl: string
}

const defaultBranding: BrandingState = {
  nameAr: 'فلويا ستور',
  nameEn: 'Floya Store',
  logoUrl: '',
}

function toBranding(data: any): BrandingState {
  return {
    nameAr: data?.store_name?.ar || defaultBranding.nameAr,
    nameEn: data?.store_name?.en || defaultBranding.nameEn,
    logoUrl: data?.logo_url || '',
  }
}

export function useStoreBranding() {
  const [branding, setBranding] = useState<BrandingState>(defaultBranding)

  useEffect(() => {
    let isMounted = true

    const loadBranding = async () => {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' })
        const data = await res.json()
        if (isMounted && data?.success) {
          setBranding(toBranding(data.data))
        }
      } catch {
        // ignore
      }
    }

    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail) {
        setBranding(toBranding(customEvent.detail))
      } else {
        loadBranding()
      }
    }

    loadBranding()
    window.addEventListener('store-branding-updated', handleUpdate as EventListener)

    return () => {
      isMounted = false
      window.removeEventListener('store-branding-updated', handleUpdate as EventListener)
    }
  }, [])

  return branding
}
