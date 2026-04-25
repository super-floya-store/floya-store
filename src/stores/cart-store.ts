import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types/cart'

interface CartState {
  items: CartItem[]
  hasHydrated: boolean
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  subtotal: () => number
  totalItems: () => number
  setHasHydrated: (value: boolean) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      addItem: (item) => {
        const { items } = get()
        const existing = items.find((i) => i.productId === item.productId)
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: Math.min(i.quantity + (item.quantity || 1), 99) }
                : i
            ),
          })
        } else {
          set({ items: [...items, { ...item, quantity: item.quantity || 1 }] })
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) })
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.min(quantity, 99) } : i
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
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
