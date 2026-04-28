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

export function normalizeStoreSettings(settings: StoreSettingsMap): StoreSettingsMap {
  const nextSettings = { ...settings }

  if (!Array.isArray(nextSettings.hero_images) || nextSettings.hero_images.length === 0) {
    nextSettings.hero_images = defaultHeroImages
  }

  return nextSettings
}

export function settingsRowsToMap(data: Array<{ key: string; value: any }>): StoreSettingsMap {
  const settings = data.reduce((acc: Record<string, any>, item) => {
    acc[item.key] = item.value
    return acc
  }, {}) as StoreSettingsMap

  return normalizeStoreSettings(settings)
}

export async function getStoreSettings(): Promise<StoreSettingsMap> {
  const { data, error } = await supabaseServer.from('settings').select('*')

  if (error || !data) {
    return normalizeStoreSettings({})
  }

  return settingsRowsToMap(data)
}

export async function upsertStoreSettingsEntries(
  entries: Array<{ key: string; value: any }>,
  updatedBy: string
): Promise<{ data: StoreSettingsMap | null; error: string | null }> {
  const { data: existingRows, error: existingError } = await supabaseServer
    .from('settings')
    .select('key')
    .in('key', entries.map((entry) => entry.key))

  if (existingError) {
    return { data: null, error: existingError.message }
  }

  const existingKeys = new Set((existingRows || []).map((row) => row.key))
  const timestamp = new Date().toISOString()

  for (const entry of entries) {
    if (existingKeys.has(entry.key)) {
      const { error } = await supabaseServer
        .from('settings')
        .update({
          value: entry.value,
          updated_by: updatedBy,
          updated_at: timestamp,
        })
        .eq('key', entry.key)

      if (error) {
        return { data: null, error: error.message }
      }
    } else {
      const { error } = await supabaseServer
        .from('settings')
        .insert({
          key: entry.key,
          value: entry.value,
          updated_by: updatedBy,
          updated_at: timestamp,
        })

      if (error) {
        return { data: null, error: error.message }
      }
    }
  }

  const { data, error: readError } = await supabaseServer.from('settings').select('*')

  if (readError || !data) {
    return { data: null, error: readError?.message || 'Failed to read updated settings' }
  }

  return { data: settingsRowsToMap(data), error: null }
}
