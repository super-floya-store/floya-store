'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { heroFallbackImages } from '@/lib/storefront-images'
import { useUIStore } from '@/stores/ui-store'
import { useStoreBranding } from '@/hooks/useStoreBranding'

export function HeroSection() {
  const locale = useUIStore((state) => state.locale)
  const branding = useStoreBranding()
  const [heroImages, setHeroImages] = useState(heroFallbackImages)
  const primaryHeroImage = heroImages[0] || heroFallbackImages[0]
  const brandName = locale === 'ar' ? branding.nameAr : branding.nameEn

  const copy = locale === 'ar'
    ? {
        kicker: 'تجربة تسوق راقية',
        subtitle: 'منتجات مختارة بعناية، عرض أوضح، وصور أفضل لتجربة شراء أسهل وأسرع على الهاتف وسطح المكتب.',
        primaryCta: 'تسوق الآن',
        secondaryCta: 'تواصل معنا',
        stats: [
          { value: '24/7', label: 'دعم سريع' },
          { value: '58', label: 'ولاية توصيل' },
          { value: '3', label: 'طرق دفع' },
        ],
      }
    : {
        kicker: 'Premium shopping experience',
        subtitle: 'Carefully selected products, clearer presentation, and stronger imagery for a faster buying experience across mobile and desktop.',
        primaryCta: 'Shop now',
        secondaryCta: 'Contact us',
        stats: [
          { value: '24/7', label: 'Fast support' },
          { value: '58', label: 'Delivery regions' },
          { value: '3', label: 'Payment methods' },
        ],
      }

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data?.hero_images) && data.data.hero_images.length > 0) {
          setHeroImages(data.data.hero_images)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section className="relative overflow-hidden px-4 pt-6 md:px-6 md:pt-8">
      <div className="container mx-auto">
        <div className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-secondary via-brand-ink to-brand-night px-6 py-16 text-secondary-foreground shadow-heavy md:px-10 lg:px-14 lg:py-24">
          <div className="absolute inset-0">
            <Image src={primaryHeroImage} alt={brandName} fill className="object-cover opacity-20" sizes="100vw" priority />
            <div className="absolute inset-0 bg-gradient-to-b from-brand-night/85 via-secondary/72 to-black/68" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(214,163,124,0.16),transparent_28%)]" />
          </div>
          <div className="hero-float absolute -right-16 top-8 h-48 w-48 rounded-full bg-primary/20 blur-3xl md:h-72 md:w-72" />
          <div className="hero-float absolute bottom-0 left-0 h-44 w-44 rounded-full bg-white/10 blur-3xl md:h-64 md:w-64" />
          <div className="premium-grid absolute inset-0 opacity-10" />

          <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
            <span className="section-kicker w-fit border-white/10 bg-white/10 text-primary-foreground">{copy.kicker}</span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.1] md:text-6xl lg:text-7xl">{brandName}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-secondary-foreground/80 md:text-lg">{copy.subtitle}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="glow-pulse min-h-[52px] rounded-full bg-gradient-to-r from-primary to-brand-gold px-8 text-base font-bold text-primary-foreground shadow-glow" asChild>
                <Link href="/products">{copy.primaryCta}</Link>
              </Button>
              <Button size="lg" variant="outline" className="min-h-[52px] rounded-full border-white/20 bg-white/10 px-8 text-base font-semibold text-white hover:bg-white/15" asChild>
                <Link href="/contact">{copy.secondaryCta}</Link>
              </Button>
            </div>

            <div className="mt-10 grid w-full gap-4 sm:grid-cols-3">
              {copy.stats.map((item) => (
                <div key={item.label} className="surface-card rounded-[24px] border-white/10 bg-white/10 px-4 py-4 text-center">
                  <div className="text-xl font-bold text-white md:text-2xl">{item.value}</div>
                  <div className="mt-1 text-xs text-secondary-foreground/70 md:text-sm">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
