'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ProductGrid } from '@/components/store/ProductGrid'
import { CommentsSection } from '@/components/store/CommentsSection'
import type { Category } from '@/types/category'
import { getFallbackCategoryImage } from '@/lib/storefront-images'

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [category, setCategory] = useState<Category | null>(null)

  useEffect(() => {
    async function fetchCategory() {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (data.success) {
        const match = data.data.find((item: Category) => item.slug === params.slug)
        setCategory(match || null)
      }
    }

    fetchCategory().catch(() => {})
  }, [params.slug])

  const coverImage = category?.image_url || category?.gallery_images?.[0] || getFallbackCategoryImage(0)

  return (
    <div className="container mx-auto flex flex-col gap-8 px-4 py-8 md:px-6 md:py-10">
      <section className="relative overflow-hidden rounded-[34px] px-6 py-10 text-secondary-foreground shadow-heavy md:px-8">
        <Image src={coverImage} alt={category?.name_ar || 'الفئة'} fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-l from-secondary/85 via-brand-ink/80 to-black/45" />
        <div className="relative flex flex-col gap-4">
          <span className="section-kicker w-fit border-white/10 bg-white/10 text-primary-foreground">تصفح المجموعة</span>
          <h1 className="text-3xl font-bold md:text-4xl">{category?.name_ar || 'منتجات الفئة'}</h1>
          <p className="max-w-2xl text-sm leading-8 text-white/85 md:text-base">
            {category?.description_ar || 'منتجات مختارة داخل هذه الفئة مع صور أوضح وتجربة تصفح أكثر راحة.'}
          </p>
        </div>
      </section>
      {category?.gallery_images?.length ? (
        <div className="grid gap-4 md:grid-cols-3">
          {category.gallery_images.slice(0, 3).map((image, index) => (
            <div key={`${image}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-[28px] shadow-soft">
              <Image src={image} alt={`${category.name_ar} ${index + 1}`} fill className="object-cover" sizes="33vw" />
            </div>
          ))}
        </div>
      ) : null}
      <ProductGrid categorySlug={params.slug} />
      {category ? <CommentsSection entityType="category" entityId={category.id} title="آراء الزوار حول هذه الفئة" /> : null}
    </div>
  )
}
