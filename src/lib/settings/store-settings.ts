import { supabaseServer } from '@/lib/supabase/server'

export interface StoreSettingsMap {
  store_name?: { ar?: string; en?: string }
  store_description?: { ar?: string; en?: string }
  store_phone?: string
  store_whatsapp?: string
  store_email?: string
  store_address?: { ar?: string; en?: string }
  logo_url?: string
  favicon_url?: string
  hero_images?: string[]
  social_links?: Record<string, string>
  admin_notification_email?: string
  email_sender_name?: string
  email_sender_address?: string
  order_email_enabled?: boolean
  email_templates?: {
    order_confirmation?: { subject?: string; html?: string }
    order_status_update?: { subject?: string; html?: string }
    new_comment?: { subject?: string; html?: string }
  }
  [key: string]: any
}

export const defaultHeroImages = [
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
]

export async function getStoreSettings(): Promise<StoreSettingsMap> {
  const { data, error } = await supabaseServer.from('settings').select('*')

  if (error || !data) {
    return {
      hero_images: defaultHeroImages,
    }
  }

  const settings = data.reduce((acc: Record<string, any>, item) => {
    acc[item.key] = item.value
    return acc
  }, {}) as StoreSettingsMap

  if (!Array.isArray(settings.hero_images) || settings.hero_images.length === 0) {
    settings.hero_images = defaultHeroImages
  }

  return settings
}
