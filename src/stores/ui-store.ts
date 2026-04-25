import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  cartDrawerOpen: boolean
  theme: 'light' | 'dark'
  locale: 'ar' | 'en'
  toggleSidebar: () => void
  toggleCartDrawer: () => void
  closeCartDrawer: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setLocale: (locale: 'ar' | 'en') => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      cartDrawerOpen: false,
      theme: 'light',
      locale: 'ar',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleCartDrawer: () => set((state) => ({ cartDrawerOpen: !state.cartDrawerOpen })),
      closeCartDrawer: () => set({ cartDrawerOpen: false }),
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'floya-ui',
      partialize: (state) => ({ theme: state.theme, locale: state.locale }),
    }
  )
)
