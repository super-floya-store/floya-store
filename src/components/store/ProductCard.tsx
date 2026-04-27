'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cart-store'
import type { Product } from '@/types/product'
import { getFallbackProductImage } from '@/lib/storefront-images'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/stores/ui-store'
import { useAuth } from '@/hooks/useAuth'
import { getVipDiscountedPrice } from '@/lib/pricing/vip'
import { getProductType, getProductVariantChoices } from '@/components/store/product-metadata'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth()
  const locale = useUIStore((state) => state.locale)
  const addItem = useCartStore((s) => s.addItem)
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const isWishlisted = useWishlistStore((s) => s.has(product.id))
  const router = useRouter()
  const primaryImage = product.images[product.primary_image_index] || product.images[0] || getFallbackProductImage(product.name_ar.length)
  const hasPromo = product.promo_price && product.promo_price < product.price
  const basePrice = hasPromo ? product.promo_price! : product.price
  const vipPrice = getVipDiscountedPrice(basePrice, !!user?.is_vip)
  const hasVipPrice = !!user?.is_vip && vipPrice < basePrice
  const discount = hasPromo ? Math.round(((product.price - product.promo_price!) / product.price) * 100) : 0
  const isOutOfStock = product.stock_quantity === 0
  const isNew = Date.now() - new Date(product.created_at).getTime() < 1000 * 60 * 60 * 24 * 21
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 3
  const productName = locale === 'ar' ? product.name_ar : product.name_en
  const productType = getProductType(product)
  const variantChoices = getProductVariantChoices(product)
  const hasVariants = variantChoices.length > 0
  const currency = 'DZD'
  const copy = locale === 'ar'
    ? {
        new: 'جديد',
        lowStock: 'كمية محدودة',
        outOfStock: 'نفذ المخزون',
        wishlist: 'المفضلة',
        add: 'أضف',
        soldOutShort: 'نفذ',
        buyNow: 'شراء الآن',
        chooseVariant: 'اختر النسخة',
        optionsCount: 'خيارات',
        digital: 'رقمي',
      }
    : {
        new: 'New',
        lowStock: 'Low stock',
        outOfStock: 'Out of stock',
        wishlist: 'Wishlist',
        add: 'Add',
        soldOutShort: 'Sold out',
        buyNow: 'Buy now',
        chooseVariant: 'Choose variant',
        optionsCount: 'options',
        digital: 'Digital',
      }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (hasVariants) {
      router.push(`/products/${product.id}`)
      return
    }
    if (isOutOfStock) return
    addItem({
      productId: product.id,
      name: productName,
      price: vipPrice,
      image: primaryImage,
      productType,
      variantId: null,
      variantLabel: null,
    })
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    if (hasVariants) {
      e.preventDefault()
      e.stopPropagation()
      router.push(`/products/${product.id}`)
      return
    }
    handleAddToCart(e)
    router.push('/checkout')
  }

  return (
    <div className="group fade-up-in relative overflow-hidden rounded-[30px] border border-white/60 bg-gradient-to-br from-white/95 to-white/72 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-medium">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={productName}
              fill
              className="object-cover transition duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-background">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 via-transparent to-transparent opacity-80" />
          {hasPromo && (
            <Badge className="absolute right-3 top-3 rounded-full border-0 bg-gradient-to-r from-destructive to-primary px-3 py-1 text-white shadow-soft">
              -{discount}%
            </Badge>
          )}
          {isNew && <Badge className="absolute left-3 top-3 rounded-full bg-secondary text-secondary-foreground">{copy.new}</Badge>}
          {isLowStock && <Badge className="absolute left-3 top-12 rounded-full bg-amber-500 text-white">{copy.lowStock}</Badge>}
          {productType === 'digital' && (
            <Badge className="absolute bottom-3 right-3 rounded-full border-0 bg-secondary text-secondary-foreground">
              {copy.digital}
            </Badge>
          )}
          {isOutOfStock && (
            <>
              <div className="absolute inset-0 bg-secondary/50 backdrop-blur-[2px]" />
              <Badge variant="secondary" className="absolute left-3 top-3 rounded-full border border-white/20 bg-white/90 px-3 py-1 text-secondary shadow-soft">
                {copy.outOfStock}
              </Badge>
            </>
          )}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id) }}
            className={`absolute bottom-3 left-3 inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-white/30 backdrop-blur ${isWishlisted ? 'bg-primary text-primary-foreground' : 'bg-white/85 text-foreground'}`}
            aria-label={copy.wishlist}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>
      </Link>

      <div className="flex flex-col gap-3 p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="min-h-[44px] line-clamp-2 text-sm font-bold leading-7 text-foreground transition-colors group-hover:text-primary md:text-base">
            {productName}
          </h3>
        </Link>
        {hasVariants ? (
          <p className="text-xs font-medium text-muted-foreground">
            {variantChoices.length} {copy.optionsCount}
          </p>
        ) : null}

        <div className="flex items-end gap-2">
          {hasVipPrice ? (
            <>
              <span className="text-lg font-bold text-primary md:text-xl">{vipPrice.toLocaleString()} {currency}</span>
              <span className="text-muted-foreground text-sm line-through">{basePrice.toLocaleString()} {currency}</span>
            </>
          ) : hasPromo ? (
            <>
              <span className="text-lg font-bold text-primary md:text-xl">{product.promo_price!.toLocaleString()} {currency}</span>
              <span className="text-muted-foreground text-sm line-through">{product.price.toLocaleString()} {currency}</span>
            </>
          ) : (
            <span className="text-lg font-bold text-foreground md:text-xl">{product.price.toLocaleString()} {currency}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            className="min-h-[44px] w-full rounded-full bg-gradient-to-r from-secondary to-brand-ink text-secondary-foreground shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-medium"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 ml-2" />
            {isOutOfStock ? copy.soldOutShort : hasVariants ? copy.chooseVariant : copy.add}
          </Button>
          <Button size="sm" variant="outline" className="min-h-[44px] rounded-full" disabled={isOutOfStock} onClick={handleBuyNow}>
            <Zap className="h-4 w-4 ml-2" />
            {copy.buyNow}
          </Button>
        </div>
      </div>
    </div>
  )
}
