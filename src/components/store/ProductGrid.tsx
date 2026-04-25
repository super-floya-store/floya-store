'use client'

import { useState, useEffect } from 'react'
import { ProductCard } from './ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { Product } from '@/types/product'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'

interface ProductGridProps {
  categorySlug?: string
}

export function ProductGrid({ categorySlug }: ProductGridProps) {
  const locale = useUIStore((state) => state.locale)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('newest')
  const [search, setSearch] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const copy = locale === 'ar'
    ? {
        empty: 'لا توجد منتجات متاحة حالياً',
        emptyBody: 'سيظهر هذا القسم بشكل رائع فور إضافة أول المنتجات إلى المتجر.',
        search: 'ابحث داخل المنتجات',
        newest: 'الأحدث',
        priceAsc: 'السعر: من الأقل',
        priceDesc: 'السعر: من الأعلى',
        name: 'الاسم',
        minPrice: 'أقل سعر',
        maxPrice: 'أعلى سعر',
        inStockOnly: 'المتوفر فقط',
        inStockFilter: 'فلتر المتوفر',
      }
    : {
        empty: 'No products are available right now',
        emptyBody: 'This section will populate as soon as products are added to the store.',
        search: 'Search products',
        newest: 'Newest',
        priceAsc: 'Price: low to high',
        priceDesc: 'Price: high to low',
        name: 'Name',
        minPrice: 'Min price',
        maxPrice: 'Max price',
        inStockOnly: 'In stock only',
        inStockFilter: 'Stock filter',
      }

  useEffect(() => {
    async function fetchProducts() {
      try {
        const params = new URLSearchParams()
        if (categorySlug) params.set('category', categorySlug)
        if (sort) params.set('sort', sort)
        if (search.trim()) params.set('search', search.trim())
        if (inStockOnly) params.set('inStock', 'true')
        if (minPrice) params.set('minPrice', minPrice)
        if (maxPrice) params.set('maxPrice', maxPrice)
        const url = `/api/products?${params.toString()}`
        const res = await fetch(url)
        const data = await res.json()
        if (data.success) {
          setProducts(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [categorySlug, sort, search, inStockOnly, minPrice, maxPrice])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-[30px] border border-white/60 bg-white/80 shadow-soft">
            <Skeleton className="shimmer-surface aspect-[4/5]" />
            <div className="flex flex-col gap-3 p-4">
              <Skeleton className="shimmer-surface h-4 w-3/4 rounded-full" />
              <Skeleton className="shimmer-surface h-4 w-1/2 rounded-full" />
              <Skeleton className="shimmer-surface h-11 w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="surface-card flex flex-col items-center gap-4 rounded-[30px] px-6 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">✦</div>
        <p className="text-base font-semibold text-secondary">{copy.empty}</p>
        <p className="max-w-md text-sm leading-7 text-muted-foreground">{copy.emptyBody}</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="surface-card rounded-[28px] p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={copy.search} className="min-h-[46px] rounded-2xl border border-border bg-white px-4 text-sm text-foreground" />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="min-h-[46px] rounded-2xl border border-border bg-white px-4 text-sm text-foreground">
            <option value="newest">{copy.newest}</option>
            <option value="price_asc">{copy.priceAsc}</option>
            <option value="price_desc">{copy.priceDesc}</option>
            <option value="name_asc">{copy.name}</option>
          </select>
          <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} type="number" placeholder={copy.minPrice} className="min-h-[46px] rounded-2xl border border-border bg-white px-4 text-sm text-foreground" />
          <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} type="number" placeholder={copy.maxPrice} className="min-h-[46px] rounded-2xl border border-border bg-white px-4 text-sm text-foreground" />
          <Button type="button" variant={inStockOnly ? 'default' : 'outline'} className="min-h-[46px] rounded-2xl" onClick={() => setInStockOnly((v) => !v)}>
            {inStockOnly ? copy.inStockOnly : copy.inStockFilter}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
