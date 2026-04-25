import { ProductGrid } from '@/components/store/ProductGrid'

export default function ProductsPage() {
  return (
    <div className="container mx-auto flex flex-col gap-8 px-4 py-8 md:px-6 md:py-10">
      <section className="surface-card overflow-hidden rounded-[32px] px-6 py-8 md:px-8">
        <span className="section-kicker w-fit">جميع المنتجات</span>
        <h1 className="section-title mt-4">جميع المنتجات</h1>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-muted-foreground md:text-base">
          اكتشفي أحدث المنتجات ببطاقات أوضح وصور أكبر وتجربة تصفح مريحة على كل المقاسات.
        </p>
        <div className="section-divider" />
      </section>
      <ProductGrid />
    </div>
  )
}
