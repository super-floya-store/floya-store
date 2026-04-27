export type ProductType = 'physical' | 'digital'

export interface CartItem {
  cartItemId: string
  productId: string
  name: string
  price: number
  image: string | null
  quantity: number
  productType: ProductType
  variantId: string | null
  variantLabel: string | null
}

export interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'cartItemId' | 'quantity'> & { quantity?: number }) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  subtotal: () => number
  totalItems: () => number
}

export function normalizeProductType(value: unknown): ProductType {
  if (typeof value === 'string') {
    const normalized = value.toLowerCase()

    if (normalized.includes('digital')) {
      return 'digital'
    }
  }

  return 'physical'
}

export function buildCartItemId(productId: string, variantId?: string | null, variantLabel?: string | null) {
  const suffix = variantId || variantLabel || 'default'
  return `${productId}::${suffix}`
}

export function getCartFulfillment(items: Array<Pick<CartItem, 'productType'>>) {
  const hasDigital = items.some((item) => item.productType === 'digital')
  const hasPhysical = items.some((item) => item.productType === 'physical')

  return {
    hasDigital,
    hasPhysical,
    isDigitalOnly: hasDigital && !hasPhysical,
    isMixed: hasDigital && hasPhysical,
  }
}
