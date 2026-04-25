'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useCartStore } from '@/stores/cart-store'
import { ShoppingCart, Minus, Plus } from 'lucide-react'
import type { Product } from '@/types/product'
import { CommentsSection } from '@/components/store/CommentsSection'
import { getFallbackProductImage } from '@/lib/storefront-images'
import { useRecentlyViewedStore } from '@/stores/recently-viewed-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { Heart, Zap } from 'lucide-react'

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const addItem = useCartStore((s) => s.addItem)
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.add)
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const isWishlisted = useWishlistStore((s) => product ? s.has(product.id) : false)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${params.id}`)
        const data = await res.json()
        if (data.success) {
          setProduct(data.data)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    if (params.id) fetchProduct()
  }, [params.id])

  useEffect(() => {
    if (product) addRecentlyViewed(product.id)
  }, [product, addRecentlyViewed])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Skeleton className="shimmer-surface aspect-square rounded-[34px]" />
          <div className="flex flex-col gap-4">
            <Skeleton className="shimmer-surface h-8 w-3/4 rounded-full" />
            <Skeleton className="shimmer-surface h-6 w-1/4 rounded-full" />
            <Skeleton className="shimmer-surface h-32 rounded-[28px]" />
            <Skeleton className="shimmer-surface h-12 w-40 rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">المنتج غير موجود</h1>
        <Button asChild>
          <Link href="/products">العودة للمنتجات</Link>
        </Button>
      </div>
    )
  }

  const galleryImages = product.images.length > 0 ? product.images : [getFallbackProductImage(0)]
  const primaryImage = galleryImages[selectedImageIndex] || galleryImages[product.primary_image_index] || galleryImages[0]
  const hasPromo = product.promo_price && product.promo_price < product.price
  const isOutOfStock = product.stock_quantity === 0

  const handleAddToCart = () => {
    if (isOutOfStock) return
    addItem({
      productId: product.id,
      name: product.name_ar,
      price: hasPromo ? product.promo_price! : product.price,
      image: primaryImage,
      quantity,
    })
  }

  const handleBuyNow = () => {
    handleAddToCart()
    window.location.href = '/checkout'
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
        <div className="surface-card overflow-hidden rounded-[34px] p-3">
          <div className="relative aspect-square overflow-hidden rounded-[28px] bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name_ar}
              fill
              className="object-cover transition duration-700 hover:scale-110"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ShoppingCart className="h-24 w-24 text-muted-foreground" />
            </div>
          )}
            {hasPromo && (
              <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-destructive to-primary px-4 py-2 text-sm font-bold text-white shadow-glow">
                وفر {Math.round(((product.price - product.promo_price!) / product.price) * 100)}%
              </div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {galleryImages.slice(0, 6).map((image, index) => (
              <button
                type="button"
                key={`${image}-${index}`}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative aspect-square overflow-hidden rounded-[22px] border shadow-soft transition ${
                  selectedImageIndex === index ? 'border-primary ring-2 ring-primary/20' : 'border-white/70'
                }`}
              >
                <Image src={image} alt={`${product.name_ar} ${index + 1}`} fill className="object-cover" sizes="20vw" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <span className="section-kicker w-fit">تفاصيل المنتج</span>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-foreground md:text-5xl">{product.name_ar}</h1>
            {product.category && (
              <Link href={`/categories/${product.category.slug}`} className="mt-4 inline-flex">
                <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-sm shadow-soft">{product.category.name_ar}</Badge>
              </Link>
            )}
          </div>

          <div className="surface-card flex flex-wrap items-center gap-3 rounded-[30px] px-5 py-5">
            {hasPromo ? (
              <>
                <span className="text-3xl font-bold text-primary md:text-4xl">{product.promo_price!.toLocaleString()} د.ج</span>
                <span className="text-lg text-muted-foreground line-through md:text-2xl">{product.price.toLocaleString()} د.ج</span>
              </>
            ) : (
              <span className="text-3xl font-bold text-secondary md:text-4xl">{product.price.toLocaleString()} د.ج</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm md:text-base">
            <span className={`text-sm font-medium ${isOutOfStock ? 'text-destructive' : 'text-green-600'}`}>
              {isOutOfStock ? 'نفذ المخزون' : `متوفر (${product.stock_quantity} قطعة)`}
            </span>
          </div>

          {product.description_ar && (
            <div className="surface-card rounded-[30px] px-5 py-5">
              <h2 className="text-lg font-bold text-secondary">تفاصيل المنتج</h2>
              <p className="mt-3 text-sm leading-8 text-muted-foreground md:text-base">{product.description_ar}</p>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-white/75 p-4">
                  <p className="text-xs text-muted-foreground">دليل المقاس</p>
                  <p className="mt-2 font-bold text-foreground">اختاري مقاسك المعتاد، وإذا كنت بين مقاسين اختاري الأكبر.</p>
                </div>
                <div className="rounded-2xl bg-white/75 p-4">
                  <p className="text-xs text-muted-foreground">الألوان</p>
                  <div className="mt-3 flex gap-2">
                    {['#111827', '#d6a37c', '#f2e9e4'].map((color) => <span key={color} className="size-6 rounded-full border" style={{ backgroundColor: color }} />)}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/75 p-4">
                  <p className="text-xs text-muted-foreground">التوصيل</p>
                  <p className="mt-2 font-bold text-foreground">يشحن عادة خلال 24-72 ساعة حسب الولاية.</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex items-center rounded-full border border-border bg-white/80 p-1 shadow-soft">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition hover:bg-accent"
                disabled={isOutOfStock}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock_quantity || 99, quantity + 1))}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition hover:bg-accent"
                disabled={isOutOfStock}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button size="lg" className="glow-pulse min-h-[52px] flex-1 rounded-full bg-gradient-to-r from-primary to-brand-gold text-base font-bold text-primary-foreground shadow-glow transition duration-300 hover:-translate-y-0.5" disabled={isOutOfStock} onClick={handleAddToCart}>
              <ShoppingCart className="h-5 w-5 ml-2" />
              {isOutOfStock ? 'نفذ المخزون' : 'أضف للسلة'}
            </Button>
            <Button size="lg" variant="outline" className="min-h-[52px] rounded-full" disabled={isOutOfStock} onClick={handleBuyNow}>
              <Zap className="h-5 w-5 ml-2" />
              شراء الآن
            </Button>
            <Button size="icon" variant="outline" className="min-h-[52px] min-w-[52px] rounded-full" onClick={() => toggleWishlist(product.id)}>
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current text-primary' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-4 bottom-4 z-40 md:hidden">
        <Button size="lg" className="min-h-[54px] w-full rounded-full bg-gradient-to-r from-secondary to-brand-ink text-base font-bold text-secondary-foreground shadow-heavy" disabled={isOutOfStock} onClick={handleAddToCart}>
          <ShoppingCart className="h-5 w-5 ml-2" />
          {isOutOfStock ? 'نفذ المخزون' : 'أضف للسلة'}
        </Button>
      </div>

      <CommentsSection entityType="product" entityId={product.id} />
    </div>
  )
}
