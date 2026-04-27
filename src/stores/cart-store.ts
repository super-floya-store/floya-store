import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { buildCartItemId, normalizeProductType, type CartItem } from '@/types/cart'

interface CartState {
  items: CartItem[]
  hasHydrated: boolean
  addItem: (item: Omit<CartItem, 'cartItemId' | 'quantity'> & { quantity?: number }) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  subtotal: () => number
  totalItems: () => number
  setHasHydrated: (value: boolean) => void
}

function normalizeCartItem(item: Partial<CartItem> & Pick<CartItem, 'productId' | 'name' | 'price' | 'quantity'>): CartItem {
  const variantId = item.variantId || null
  const variantLabel = item.variantLabel || null

  return {
    cartItemId: item.cartItemId || buildCartItemId(item.productId, variantId, variantLabel),
    productId: item.productId,
    name: item.name,
    price: item.price,
    image: item.image || null,
    quantity: Math.min(Math.max(item.quantity, 1), 99),
    productType: normalizeProductType(item.productType),
    variantId,
    variantLabel,
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      addItem: (item) => {
        const { items } = get()
        const nextItem = normalizeCartItem({
          ...item,
          quantity: item.quantity || 1,
        })
        const existing = items.find((i) => i.cartItemId === nextItem.cartItemId)
        if (existing) {
          set({
            items: items.map((i) =>
              i.cartItemId === nextItem.cartItemId
                ? { ...i, ...nextItem, quantity: Math.min(i.quantity + (item.quantity || 1), 99) }
                : i
            ),
          })
        } else {
          set({ items: [...items, nextItem] })
        }
      },
      removeItem: (cartItemId) => {
        set({ items: get().items.filter((i) => i.cartItemId !== cartItemId) })
      },
      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.cartItemId === cartItemId ? { ...i, quantity: Math.min(quantity, 99) } : i
          ),
        })
      },
      clearCart: () => set({ items: [] }),
      subtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'floya-cart',
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as { items?: Array<Partial<CartItem> & Pick<CartItem, 'productId' | 'name' | 'price' | 'quantity'>> } | undefined

        if (!state?.items) {
          return persistedState
        }

        return {
          ...state,
          items: state.items.map((item) => normalizeCartItem(item)),
        }
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
