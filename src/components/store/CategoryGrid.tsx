'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import type { Category } from '@/types/category'
import { getFallbackCategoryImage } from '@/lib/storefront-images'
import { useUIStore } from '@/stores/ui-store'

export function CategoryGrid() {
  const locale = useUIStore((state) => state.locale)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const copy = locale === 'ar'
    ? { kicker: 'الفئات الأكثر طلباً', title: 'تصفح الفئات', cta: 'تسوق الآن' }
    : { kicker: 'Top categories', title: 'Browse categories', cta: 'Shop now' }

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        if (data.success) {
          setCategories(data.data)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="shimmer-surface h-40 rounded-[28px]" />
          ))}
        </div>
      </div>
    )
  }

  if (categories.length === 0) return null

  return (
    <section className="px-4 md:px-6">
      <div className="container mx-auto">
        <div className="mb-8 flex flex-col gap-3 md:mb-10">
          <span className="section-kicker w-fit">{copy.kicker}</span>
          <h2 className="section-title">{copy.title}</h2>
          <div className="section-divider" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group fade-up-in relative overflow-hidden rounded-[30px] border border-white/50 bg-gradient-to-br from-white/90 to-white/65 p-1 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-medium"
            >
              <div className="relative flex aspect-square items-end overflow-hidden rounded-[26px] px-4 py-5 text-white">
                <Image
                  src={category.image_url || category.gallery_images?.[0] || getFallbackCategoryImage(index)}
                  alt={locale === 'ar' ? category.name_ar : category.name_en}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/25 to-transparent" />
                <div className="absolute -left-10 top-6 size-24 rounded-full bg-primary/20 blur-2xl transition duration-500 group-hover:scale-125" />
                <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-white/10 blur-2xl transition duration-500 group-hover:translate-x-2 group-hover:translate-y-1" />
                <div className="relative flex w-full flex-col gap-3">
                  <span className="w-fit rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-primary-foreground">{copy.cta}</span>
                  <span className="text-lg font-bold leading-relaxed transition-transform group-hover:-translate-y-0.5">
                    {locale === 'ar' ? category.name_ar : category.name_en}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
