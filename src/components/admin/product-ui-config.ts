'use client'

import type { Product, ProductType } from '@/types/product'

export type AdminProductType = ProductType

export interface AdminProductVariant {
  id?: string
  sku?: string | null
  size: string
  color: string
  name_ar?: string | null
  name_en?: string | null
  stock_quantity: number
  price_override: number | null
  promo_price_override?: number | null
  low_stock_threshold?: number
  is_active?: boolean
  sort_order?: number
}

export interface AdminProductUiConfig {
  productType: AdminProductType
  variants: AdminProductVariant[]
  digitalInventoryText: string
}

export const DEFAULT_PRODUCT_UI_CONFIG: AdminProductUiConfig = {
  productType: 'physical_simple',
  variants: [],
  digitalInventoryText: '',
}

export function hydrateProductUiConfig(product?: Product | null): AdminProductUiConfig {
  if (!product) {
    return DEFAULT_PRODUCT_UI_CONFIG
  }

  return {
    productType: product.product_type || 'physical_simple',
    variants: (product.variants || []).map((variant, index) => ({
      id: variant.id,
      sku: variant.sku,
      size: variant.size || '',
      color: variant.color || '',
      name_ar: variant.name_ar,
      name_en: variant.name_en,
      stock_quantity: variant.stock_quantity || 0,
      price_override: variant.price_override,
      promo_price_override: variant.promo_price_override,
      low_stock_threshold: variant.low_stock_threshold || 3,
      is_active: variant.is_active,
      sort_order: variant.sort_order ?? index,
    })),
    digitalInventoryText: (product.digital_inventory_units || [])
      .filter((unit) => unit.status === 'available' && typeof unit.payload === 'string' && unit.payload.trim())
      .map((unit) => unit.payload!.trim())
      .join('\n'),
  }
}

export function parseDigitalInventoryText(input: string) {
  return input
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((payload) => ({
      title: null,
      payload,
      status: 'available' as const,
    }))
}

export function getDerivedStockQuantity(productType: AdminProductType, manualStockQuantity: string | number, config: AdminProductUiConfig) {
  if (productType === 'physical_variant') {
    return config.variants.reduce((total, variant) => total + Math.max(0, variant.stock_quantity || 0), 0)
  }

  if (productType === 'digital_account') {
    return parseDigitalInventoryText(config.digitalInventoryText).length
  }

  return Math.max(0, parseInt(String(manualStockQuantity || '0'), 10) || 0)
}

export function getProductTypeLabel(productType: AdminProductType) {
  switch (productType) {
    case 'physical_variant':
      return 'ملابس بمقاسات وألوان'
    case 'digital_account':
      return 'تسليم رقمي'
    default:
      return 'منتج عادي'
  }
}

export function getProductTypeTone(productType: AdminProductType) {
  switch (productType) {
    case 'physical_variant':
      return 'bg-blue-100 text-blue-800'
    case 'digital_account':
      return 'bg-violet-100 text-violet-800'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}
