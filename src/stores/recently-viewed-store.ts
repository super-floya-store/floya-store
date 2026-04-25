import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RecentlyViewedState {
  items: string[]
  add: (productId: string) => void
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (productId) => {
        const filtered = get().items.filter((id) => id !== productId)
        set({ items: [productId, ...filtered].slice(0, 12) })
      },
    }),
    { name: 'floya-recently-viewed' }
  )
)
