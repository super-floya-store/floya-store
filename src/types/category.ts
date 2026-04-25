export interface Category {
  id: string
  name_ar: string
  name_en: string
  slug: string
  description_ar: string | null
  description_en: string | null
  image_url: string | null
  gallery_images: string[]
  sort_order: number
  is_active: boolean
  parent_id: string | null
  created_at: string
  updated_at: string
}
