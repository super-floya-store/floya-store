import type { Product } from '@/types/product'
import { normalizeProductType, type ProductType } from '@/types/cart'

export interface ProductVariantChoice {
  id: string
  label: string
  stockQuantity: number | null
  isDefault: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return null
}

function readNumber(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
  }

  return null
}

function readBoolean(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (typeof record[key] === 'boolean') {
      return record[key] as boolean
    }
  }

  return false
}

export function getProductType(product: Product): ProductType {
  const raw = isRecord(product)
    ? readString(product, ['product_type', 'productType', 'type'])
    : null

  if (raw) {
    return normalizeProductType(raw.toLowerCase())
  }

  if (isRecord(product) && product.is_digital === true) {
    return 'digital'
  }

  return 'physical'
}

export function getProductVariantChoices(product: Product) {
  const source = isRecord(product)
    ? [product.variants, product.variant_options, product.options].find(Array.isArray)
    : null

  if (!Array.isArray(source)) {
    return [] as ProductVariantChoice[]
  }

  return source
    .map((variant, index) => {
      if (typeof variant === 'string') {
        return {
          id: variant,
          label: variant,
          stockQuantity: null,
          isDefault: index === 0,
        }
      }

      if (!isRecord(variant)) {
        return null
      }

      const primaryLabel = readString(variant, ['label', 'name', 'title', 'value'])
      const optionName = readString(variant, ['option_name', 'group', 'type'])
      const optionValue = readString(variant, ['option_value', 'value'])
      const size = readString(variant, ['size'])
      const color = readString(variant, ['color'])
      const label = primaryLabel || [size, color].filter(Boolean).join(' / ') || [optionName, optionValue].filter(Boolean).join(': ') || `Option ${index + 1}`

      return {
        id: readString(variant, ['id', 'code', 'sku']) || `${index}-${label}`,
        label,
        stockQuantity: readNumber(variant, ['stock_quantity', 'stockQuantity', 'quantity']),
        isDefault: readBoolean(variant, ['is_default', 'isDefault']) || index === 0,
      }
    })
    .filter((variant): variant is ProductVariantChoice => Boolean(variant))
}
