import { z } from 'zod'

export const settingsSchema = z.object({
  store_name: z.object({
    ar: z.string(),
    en: z.string(),
  }),
  store_description: z.object({
    ar: z.string(),
    en: z.string(),
  }),
  store_phone: z.string(),
  store_whatsapp: z.string(),
  store_email: z.string().email(),
  store_address: z.object({
    ar: z.string(),
    en: z.string(),
  }),
  delivery_fees: z.record(z.number()),
  free_delivery_threshold: z.string(),
  currency: z.string(),
  logo_url: z.string(),
  hero_images: z.array(z.string()),
  baridimob_rip: z.string().optional(),
  social_links: z.record(z.string()),
  seo_defaults: z.record(z.string()),
  email_notifications: z.object({
    new_order: z.boolean(),
    status_change: z.boolean(),
  }),
  admin_notification_email: z.string().email().optional(),
  email_sender_name: z.string().optional(),
  email_sender_address: z.string().optional(),
  order_email_enabled: z.boolean().optional(),
  email_templates: z.any().optional(),
})

export type SettingsInput = z.infer<typeof settingsSchema>
