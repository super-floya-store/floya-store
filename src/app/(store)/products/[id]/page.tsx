'use client'

import { useState, useEffect, useMemo } from 'react'
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
import { useUIStore } from '@/stores/ui-store'
import { Heart, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getVipDiscountedPrice } from '@/lib/pricing/vip'
import { getProductType, getProductVariantChoices } from '@/components/store/product-metadata'
import { formatPrice } from '@/lib/utils/format'

export default function ProductDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const locale = useUIStore((state) => state.locale)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const addItem = useCartStore((s) => s.addItem)
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.add)
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const isWishlisted = useWishlistStore((s) => product ? s.has(product.id) : false)
  const copy = locale === 'ar'
    ? {
        notFound: 'المنتج غير موجود',
        back: 'العودة للمنتجات',
        details: 'تفاصيل المنتج',
        save: 'وفر',
        outOfStock: 'نفذ المخزون',
        available: 'متوفر',
        pieces: 'قطعة',
        sizeGuide: 'دليل المقاس',
        sizeGuideBody: 'اختر مقاسك المعتاد، وإذا كنت بين مقاسين فاختر الأكبر.',
        colors: 'الألوان',
        delivery: 'التوصيل',
        deliveryBody: 'يشحن عادة خلال 24-72 ساعة حسب الولاية.',
        digitalDelivery: 'التسليم الرقمي',
        digitalDeliveryBody: 'يتم التسليم رقمياً بعد تأكيد الطلب ومراجعة الدفع عند الحاجة.',
        addToCart: 'أضف للسلة',
        buyNow: 'شراء الآن',
        wishlist: 'المفضلة',
        mobileAddToCart: 'أضف للسلة',
        variants: 'النسخ المتاحة',
        chooseVariant: 'اختر النسخة المناسبة قبل الإضافة إلى السلة.',
        selectedVariant: 'النسخة المحددة',
        selectVariantCta: 'حدد نسخة أولاً',
        digital: 'منتج رقمي',
      }
    : {
        notFound: 'Product not found',
        back: 'Back to products',
        details: 'Product details',
        save: 'Save',
        outOfStock: 'Out of stock',
        available: 'In stock',
        pieces: 'pcs',
        sizeGuide: 'Size guide',
        sizeGuideBody: 'Choose your usual size. If you are between sizes, pick the larger one.',
        colors: 'Colors',
        delivery: 'Delivery',
        deliveryBody: 'Usually ships within 24-72 hours depending on the wilaya.',
        digitalDelivery: 'Digital delivery',
        digitalDeliveryBody: 'Delivered digitally after order confirmation and payment review when needed.',
        addToCart: 'Add to cart',
        buyNow: 'Buy now',
        wishlist: 'Wishlist',
        mobileAddToCart: 'Add to cart',
        variants: 'Available variants',
        chooseVariant: 'Choose the correct variant before adding this item to the cart.',
        selectedVariant: 'Selected variant',
        selectVariantCta: 'Select a variant first',
        digital: 'Digital product',
      }

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

  const variantChoices = useMemo(() => (product ? getProductVariantChoices(product) : []), [product])

  useEffect(() => {
    if (!variantChoices.length) {
      setSelectedVariantId(null)
      return
    }

    const preferredVariant = variantChoices.find((variant) => variant.isDefault && variant.stockQuantity !== 0)
      || variantChoices.find((variant) => variant.stockQuantity !== 0)
      || variantChoices[0]

    setSelectedVariantId(preferredVariant.id)
  }, [variantChoices])

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
        <h1 className="text-2xl font-bold mb-4">{copy.notFound}</h1>
        <Button asChild>
          <Link href="/products">{copy.back}</Link>
        </Button>
      </div>
    )
  }

  const galleryImages = product.images.length > 0 ? product.images : [getFallbackProductImage(0)]
  const primaryImage = galleryImages[selectedImageIndex] || galleryImages[product.primary_image_index] || galleryImages[0]
  const hasPromo = product.promo_price && product.promo_price < product.price
  const basePrice = hasPromo ? product.promo_price! : product.price
  const vipPrice = getVipDiscountedPrice(basePrice, !!user?.is_vip)
  const hasVipPrice = !!user?.is_vip && vipPrice < basePrice
  const productType = getProductType(product)
  const productName = locale === 'ar' ? product.name_ar : product.name_en
  const productDescription = locale === 'ar' ? product.description_ar : (product.description_en || product.description_ar)
  const categoryName = product.category ? (locale === 'ar' ? product.category.name_ar : product.category.name_en) : null
  const selectedVariant = variantChoices.find((variant) => variant.id === selectedVariantId) || null
  const hasVariants = variantChoices.length > 0
  const availableStock = selectedVariant?.stockQuantity ?? product.stock_quantity
  const isOutOfStock = availableStock === 0
  const canPurchase = !isOutOfStock && (!hasVariants || Boolean(selectedVariant))

  const handleAddToCart = () => {
    if (!canPurchase) return
    addItem({
      productId: product.id,
      name: productName,
      price: vipPrice,
      image: primaryImage,
      quantity,
      productType,
      variantId: selectedVariant?.id || null,
      variantLabel: selectedVariant?.label || null,
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
              alt={productName}
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
                {copy.save} {Math.round(((product.price - product.promo_price!) / product.price) * 100)}%
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
                <Image src={image} alt={`${productName} ${index + 1}`} fill className="object-cover" sizes="20vw" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <span className="section-kicker w-fit">{copy.details}</span>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-foreground md:text-5xl">{productName}</h1>
            {product.category && (
              <Link href={`/categories/${product.category.slug}`} className="mt-4 inline-flex">
                <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-sm shadow-soft">{categoryName}</Badge>
              </Link>
            )}
          </div>

          <div className="surface-card flex flex-wrap items-center gap-3 rounded-[30px] px-5 py-5">
            {hasVipPrice ? (
              <>
                <span className="text-3xl font-bold text-primary md:text-4xl"><bdi>{formatPrice(vipPrice, 'DZD', locale)}</bdi></span>
                <span className="text-lg text-muted-foreground line-through md:text-2xl"><bdi>{formatPrice(basePrice, 'DZD', locale)}</bdi></span>
              </>
            ) : hasPromo ? (
              <>
                <span className="text-3xl font-bold text-primary md:text-4xl"><bdi>{formatPrice(product.promo_price!, 'DZD', locale)}</bdi></span>
                <span className="text-lg text-muted-foreground line-through md:text-2xl"><bdi>{formatPrice(product.price, 'DZD', locale)}</bdi></span>
              </>
            ) : (
              <span className="text-3xl font-bold text-secondary md:text-4xl"><bdi>{formatPrice(product.price, 'DZD', locale)}</bdi></span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm md:text-base">
            <span className={`text-sm font-medium ${isOutOfStock ? 'text-destructive' : 'text-green-600'}`}>
              {isOutOfStock ? copy.outOfStock : `${copy.available} (${availableStock} ${copy.pieces})`}
            </span>
          </div>

          {productType === 'digital' ? (
            <div className="rounded-[24px] border border-primary/20 bg-primary/5 px-4 py-4 text-sm leading-7 text-foreground">
              <Badge className="mb-3 rounded-full bg-secondary text-secondary-foreground">{copy.digital}</Badge>
              <p>{copy.digitalDeliveryBody}</p>
            </div>
          ) : null}

          {hasVariants ? (
            <div className="surface-card rounded-[30px] px-5 py-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-secondary">{copy.variants}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{copy.chooseVariant}</p>
                </div>
                {selectedVariant ? (
                  <Badge variant="secondary" className="w-fit rounded-full px-4 py-1.5 text-sm shadow-soft">
                    {copy.selectedVariant}: {selectedVariant.label}
                  </Badge>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {variantChoices.map((variant) => {
                  const unavailable = variant.stockQuantity === 0
                  const active = selectedVariant?.id === variant.id

                  return (
                    <button
                      type="button"
                      key={variant.id}
                      onClick={() => setSelectedVariantId(variant.id)}
                      disabled={unavailable}
                      className={`rounded-full border px-4 py-3 text-sm font-semibold transition ${
                        active
                          ? 'border-primary bg-primary text-primary-foreground shadow-soft'
                          : unavailable
                            ? 'cursor-not-allowed border-border bg-muted text-muted-foreground opacity-60'
                            : 'border-border bg-white/80 text-foreground hover:border-primary/40'
                      }`}
                    >
                      {variant.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}

          {productDescription && (
            <div className="surface-card rounded-[30px] px-5 py-5">
              <h2 className="text-lg font-bold text-secondary">{copy.details}</h2>
              <p className="mt-3 text-sm leading-8 text-muted-foreground md:text-base">{productDescription}</p>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-white/75 p-4">
                  <p className="text-xs text-muted-foreground">{copy.sizeGuide}</p>
                  <p className="mt-2 font-bold text-foreground">{copy.sizeGuideBody}</p>
                </div>
                <div className="rounded-2xl bg-white/75 p-4">
                  <p className="text-xs text-muted-foreground">{copy.colors}</p>
                  <div className="mt-3 flex gap-2">
                    {['#111827', '#d6a37c', '#f2e9e4'].map((color) => <span key={color} className="size-6 rounded-full border" style={{ backgroundColor: color }} />)}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/75 p-4">
                  <p className="text-xs text-muted-foreground">{productType === 'digital' ? copy.digitalDelivery : copy.delivery}</p>
                  <p className="mt-2 font-bold text-foreground">{productType === 'digital' ? copy.digitalDeliveryBody : copy.deliveryBody}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex items-center rounded-full border border-border bg-white/80 p-1 shadow-soft">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition hover:bg-accent"
                disabled={!canPurchase}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(availableStock || 99, quantity + 1))}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition hover:bg-accent"
                disabled={!canPurchase}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button size="lg" className="glow-pulse min-h-[52px] flex-1 rounded-full bg-gradient-to-r from-primary to-brand-gold text-base font-bold text-primary-foreground shadow-glow transition duration-300 hover:-translate-y-0.5" disabled={!canPurchase} onClick={handleAddToCart}>
              <ShoppingCart className="h-5 w-5 ml-2" />
              {isOutOfStock ? copy.outOfStock : !selectedVariant && hasVariants ? copy.selectVariantCta : copy.addToCart}
            </Button>
            <Button size="lg" variant="outline" className="min-h-[52px] rounded-full" disabled={!canPurchase} onClick={handleBuyNow}>
              <Zap className="h-5 w-5 ml-2" />
              {copy.buyNow}
            </Button>
            <Button size="icon" variant="outline" className="min-h-[52px] min-w-[52px] rounded-full" onClick={() => toggleWishlist(product.id)} aria-label={copy.wishlist}>
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current text-primary' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-4 bottom-4 z-40 md:hidden">
        <Button size="lg" className="min-h-[54px] w-full rounded-full bg-gradient-to-r from-secondary to-brand-ink text-base font-bold text-secondary-foreground shadow-heavy" disabled={!canPurchase} onClick={handleAddToCart}>
          <ShoppingCart className="h-5 w-5 ml-2" />
          {isOutOfStock ? copy.outOfStock : !selectedVariant && hasVariants ? copy.selectVariantCta : copy.mobileAddToCart}
        </Button>
      </div>

      <CommentsSection entityType="product" entityId={product.id} />
    </div>
  )
}
