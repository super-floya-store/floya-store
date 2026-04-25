import type { Category } from './category'

export interface Product {
  id: string
  name_ar: string
  name_en: string
  slug: string
  description_ar: string | null
  description_en: string | null
  price: number
  promo_price: number | null
  category_id: string
  images: string[]
  primary_image_index: number
  stock_quantity: number
  is_published: boolean
  is_featured: boolean
  weight: number | null
  tags: string[]
  seo_title: string | null
  seo_description: string | null
  supplier_id?: string | null
  low_stock_threshold?: number
  created_by: string | null
  created_at: string
  updated_at: string
  category?: Category
}

export interface ProductFilter {
  page?: number
  limit?: number
  category?: string
  search?: string
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc'
  minPrice?: number
  maxPrice?: number
  featured?: boolean
  inStock?: boolean
}
