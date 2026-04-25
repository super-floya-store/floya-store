'use client'

import { useState, useEffect } from 'react'
import { ProductCard } from './ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { Product } from '@/types/product'

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const featuredRes = await fetch('/api/products?featured=true&limit=8')
        const featuredData = await featuredRes.json()

        if (featuredData.success && Array.isArray(featuredData.data) && featuredData.data.length > 0) {
          setProducts(featuredData.data)
          return
        }

        const latestRes = await fetch('/api/products?limit=8')
        const latestData = await latestRes.json()

        if (latestData.success && Array.isArray(latestData.data)) {
          setProducts(latestData.data)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="shimmer-surface h-[320px] rounded-[30px]" />
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="px-4 md:px-6">
      <div className="container mx-auto">
        <div className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="section-kicker w-fit">اختيارات مميزة</span>
            <h2 className="section-title mt-4">منتجات مميزة</h2>
            <div className="section-divider" />
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
            منتجات محبوبة بتقديم أوضح وصور أفضل، لتسهيل المقارنة ورفع ثقة العميل أثناء التصفح.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
