'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/stores/ui-store'

export function LocaleSync() {
  const locale = useUIStore((state) => state.locale)

  useEffect(() => {
    const html = document.documentElement
    html.lang = locale
    html.dir = locale === 'ar' ? 'rtl' : 'ltr'
  }, [locale])

  return null
}
