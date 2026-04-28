import type { Category } from './category'

export type ProductType = 'physical_simple' | 'physical_variant' | 'digital_account' | 'digital_text'

export interface ProductVariant {
  id: string
  product_id: string
  sku: string | null
  size: string | null
  color: string | null
  name_ar: string | null
  name_en: string | null
  price_override: number | null
  promo_price_override: number | null
  stock_quantity: number
  low_stock_threshold: number
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface DigitalInventoryUnit {
  id: string
  product_id: string
  variant_id: string | null
  title: string | null
  payload?: string
  status: 'available' | 'reserved' | 'delivered' | 'revoked'
  order_item_id: string | null
  reserved_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
}

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
  product_type: ProductType
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
  variants?: ProductVariant[]
  digital_inventory_units?: DigitalInventoryUnit[]
  available_digital_units?: number
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
