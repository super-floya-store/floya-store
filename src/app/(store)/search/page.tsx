'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from '@/components/store/ProductCard'
import { useDebounce } from '@/hooks/useDebounce'
import { useUIStore } from '@/stores/ui-store'
import type { Product } from '@/types/product'

export default function SearchPage() {
  const locale = useUIStore((state) => state.locale)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const copy = locale === 'ar'
    ? {
        kicker: 'ابحث بسرعة',
        title: 'البحث',
        body: 'ابحث عن المنتج مباشرة بالاسم واستعرض النتائج بشكل أوضح وأسرع.',
        placeholder: 'ابحث عن منتج...',
        quick: 'اقتراحات سريعة',
        noResults: 'لا توجد نتائج للبحث عن',
        start: 'اكتب كلمة البحث للبدء',
      }
    : {
        kicker: 'Quick search',
        title: 'Search',
        body: 'Search products by name and browse the results in a cleaner, faster view.',
        placeholder: 'Search for a product...',
        quick: 'Quick suggestions',
        noResults: 'No results found for',
        start: 'Type a search term to begin',
      }

  useEffect(() => {
    if (!debouncedQuery) {
      setProducts([])
      return
    }
    setLoading(true)
    fetch(`/api/products?search=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProducts(data.data)
      })
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  return (
    <div className="container mx-auto flex flex-col gap-8 px-4 py-8 md:px-6">
      <section className="surface-card rounded-[32px] px-6 py-8">
        <span className="section-kicker w-fit">{copy.kicker}</span>
        <h1 className="section-title mt-4">{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-muted-foreground md:text-base">{copy.body}</p>
      </section>

      <div className="mx-auto w-full max-w-2xl">
        <Input
          placeholder={copy.placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-[56px] rounded-full border-white/80 bg-white/80 px-6 text-lg shadow-soft"
        />
        {query && products.length > 0 && (
          <div className="mt-3 rounded-[24px] border border-white/70 bg-white/85 p-3 shadow-soft">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">{copy.quick}</p>
            <div className="flex flex-wrap gap-2">
              {products.slice(0, 5).map((product) => (
                <a key={product.id} href={`/products/${product.id}`} className="rounded-full bg-primary/10 px-3 py-2 text-sm text-primary">
                  {locale === 'ar' ? product.name_ar : product.name_en}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="shimmer-surface h-80 rounded-[30px]" />)}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : query ? (
        <Card className="surface-card rounded-[30px] border-white/70">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{copy.noResults} &quot;{query}&quot;</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="surface-card rounded-[30px] border-white/70">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{copy.start}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
