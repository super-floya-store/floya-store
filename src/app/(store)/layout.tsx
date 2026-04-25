import { StoreHeader } from '@/components/store/StoreHeader'
import { StoreFooter } from '@/components/store/StoreFooter'
import { CartDrawer } from '@/components/store/CartDrawer'

export const dynamic = 'force-dynamic'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="premium-scrollbar min-h-screen overflow-x-clip">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-48 bg-gradient-to-b from-primary/8 via-transparent to-transparent" />
      <StoreHeader />
      <main className="relative z-10 flex-1 pb-10">{children}</main>
      <StoreFooter />
      <CartDrawer />
    </div>
  )
}
