export interface Settings {
  store_name: { ar: string; en: string }
  store_description: { ar: string; en: string }
  store_phone: string
  store_whatsapp: string
  store_email: string
  store_address: { ar: string; en: string }
  delivery_fees: Record<string, number>
  free_delivery_threshold: string
  currency: string
  logo_url: string
  favicon_url?: string
  hero_images: string[]
  baridimob_rip?: string
  binance_wallet_address?: string
  payment_methods?: {
    baridimob: boolean
    cod: boolean
    binance: boolean
  }
  social_links: Record<string, string>
  seo_defaults: Record<string, string>
  email_notifications: { new_order: boolean; status_change: boolean }
  admin_notification_email?: string
  email_sender_name?: string
  email_sender_address?: string
  order_email_enabled?: boolean
  email_templates?: {
    order_confirmation?: { subject: string; html: string }
    order_status_update?: { subject: string; html: string }
    new_comment?: { subject: string; html: string }
  }
}
