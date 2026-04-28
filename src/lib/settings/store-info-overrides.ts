import type { StoreSettingsMap } from './store-settings'

const STORE_INFO_OVERRIDES = {
  store_email: 'castarokio@gmail.com',
  admin_notification_email: 'castarokio@gmail.com',
  store_phone: '+213540211250',
  store_whatsapp: '+213540211250',
}

export function applyStoreInfoOverrides<T extends Record<string, any>>(settings: T): T {
  return {
    ...settings,
    ...STORE_INFO_OVERRIDES,
  }
}

export function getStoreInfoOverrides(): Pick<
  StoreSettingsMap,
  'store_email' | 'admin_notification_email' | 'store_phone' | 'store_whatsapp'
> {
  return { ...STORE_INFO_OVERRIDES }
}
