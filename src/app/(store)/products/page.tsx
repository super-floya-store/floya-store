'use client'

import { ProductGrid } from '@/components/store/ProductGrid'
import { useUIStore } from '@/stores/ui-store'

export default function ProductsPage() {
  const locale = useUIStore((state) => state.locale)
  const copy = locale === 'ar'
    ? {
        kicker: 'جميع المنتجات',
        title: 'جميع المنتجات',
        body: 'اكتشف أحدث المنتجات ببطاقات أوضح وصور أكبر وتجربة تصفح مريحة على كل المقاسات.',
      }
    : {
        kicker: 'All products',
        title: 'All products',
        body: 'Explore the latest products with clearer cards, larger visuals, and a smoother browsing experience on every screen size.',
      }

  return (
    <div className="container mx-auto flex flex-col gap-8 px-4 py-8 md:px-6 md:py-10">
      <section className="surface-card overflow-hidden rounded-[32px] px-6 py-8 md:px-8">
        <span className="section-kicker w-fit">{copy.kicker}</span>
        <h1 className="section-title mt-4">{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-muted-foreground md:text-base">
          {copy.body}
        </p>
        <div className="section-divider" />
      </section>
      <ProductGrid />
    </div>
  )
}
