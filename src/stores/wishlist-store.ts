import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistState {
  items: string[]
  hasHydrated: boolean
  toggle: (productId: string) => void
  has: (productId: string) => boolean
  setHasHydrated: (value: boolean) => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      toggle: (productId) => {
        const exists = get().items.includes(productId)
        set({ items: exists ? get().items.filter((id) => id !== productId) : [...get().items, productId] })
      },
      has: (productId) => get().items.includes(productId),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'floya-wishlist',
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
)
