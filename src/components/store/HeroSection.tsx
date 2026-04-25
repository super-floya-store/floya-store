'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { heroFallbackImages } from '@/lib/storefront-images'
import { useEffect, useState } from 'react'
import { useUIStore } from '@/stores/ui-store'

export function HeroSection() {
  const locale = useUIStore((state) => state.locale)
  const [heroImages, setHeroImages] = useState(heroFallbackImages)
  const primaryHeroImage = heroImages[0] || heroFallbackImages[0]
  const secondaryHeroImage = heroImages[1] || heroFallbackImages[1] || primaryHeroImage
  const tertiaryHeroImage = heroImages[2] || heroFallbackImages[2] || primaryHeroImage

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

  const copy = locale === 'ar'
    ? {
        kicker: 'تجربة تسوق راقية',
        title: 'فلويا ستور',
        subtitle: 'تشكيلة أنيقة من المنتجات المختارة بعناية مع تفاصيل واضحة، صور أجمل، وتجربة شراء مريحة من أول زيارة.',
        primaryCta: 'تسوق الآن',
        secondaryCta: 'وصل حديثاً',
        stats: [
          { value: '24/7', label: 'دعم سريع' },
          { value: '58', label: 'ولاية توصيل' },
          { value: 'ثقة', label: 'تجربة واضحة' },
        ],
        seasonKicker: 'مختارات الموسم',
        seasonTitle: 'منتجات يومية بتقديم أكثر أناقة',
        seasonTag: 'وصول سريع',
        collectionTag: 'اختيارات منتقاة',
        collectionText: 'صور هادئة ومنسقة تبرز المنتج من غير كسر توازن الواجهة.',
        touchText: 'واجهة لمسية مريحة ومناسبة للهاتف',
        chips: [
          { label: 'تجربة شراء أوضح', value: 'واجهة سهلة' },
          { label: 'صور مضبوطة', value: 'Responsive' },
          { label: 'خيارات دفع', value: 'BaridiMob / COD / Binance' },
        ],
      }
    : {
        kicker: 'Premium shopping experience',
        title: 'Floya Store',
        subtitle: 'A refined selection of products with clearer details, better imagery, and a smoother buying journey from the first visit.',
        primaryCta: 'Shop now',
        secondaryCta: 'New arrivals',
        stats: [
          { value: '24/7', label: 'Fast support' },
          { value: '58', label: 'Delivery regions' },
          { value: 'Trust', label: 'Clear shopping flow' },
        ],
        seasonKicker: 'Season highlights',
        seasonTitle: 'Everyday products with a sharper presentation',
        seasonTag: 'Fast arrival',
        collectionTag: 'Curated picks',
        collectionText: 'Balanced photography and layout that keep the product in focus.',
        touchText: 'Comfortable mobile-first browsing',
        chips: [
          { label: 'Clearer checkout', value: 'Easy flow' },
          { label: 'Sharper media', value: 'Responsive' },
          { label: 'Payment options', value: 'BaridiMob / COD / Binance' },
        ],
      }

  return (
    <section className="relative overflow-hidden px-4 pt-6 md:px-6 md:pt-8">
      <div className="container mx-auto">
        <div className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-secondary via-brand-ink to-brand-night px-6 py-14 text-secondary-foreground shadow-heavy md:px-10 lg:px-14 lg:py-20">
          <div className="absolute inset-0">
            <Image
              src={primaryHeroImage}
              alt="خلفية فلويا"
              fill
              className="object-cover opacity-20"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-l from-brand-night/92 via-secondary/82 to-black/62" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(214,163,124,0.18),transparent_24%)]" />
          </div>
          <div className="absolute inset-0 bg-hero-radial opacity-90" />
          <div className="hero-float absolute -right-16 top-10 h-48 w-48 rounded-full bg-primary/20 blur-3xl md:h-72 md:w-72" />
          <div className="hero-float absolute bottom-0 left-0 h-44 w-44 rounded-full bg-white/10 blur-3xl md:h-64 md:w-64" />
          <div className="premium-grid absolute inset-0 opacity-10" />

          <div className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="fade-up-in flex flex-col gap-6">
              <span className="section-kicker w-fit border-white/10 bg-white/10 text-primary-foreground">{copy.kicker}</span>
              <div className="flex flex-col gap-4">
                <h1 className="max-w-3xl text-4xl font-bold leading-[1.15] md:text-6xl lg:text-7xl">
                  {copy.title}
                </h1>
                <p className="max-w-2xl text-base leading-8 text-secondary-foreground/78 md:text-lg">
                  {copy.subtitle}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="glow-pulse min-h-[52px] rounded-full bg-gradient-to-r from-primary to-brand-gold px-8 text-base font-bold text-primary-foreground shadow-glow transition duration-300 hover:-translate-y-0.5"
                  asChild
                >
                  <Link href="/products">{copy.primaryCta}</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="min-h-[52px] rounded-full border-white/20 bg-white/10 px-8 text-base font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/15"
                  asChild
                >
                  <Link href="/categories/new-arrivals">{copy.secondaryCta}</Link>
                </Button>
              </div>

              <div className="grid gap-4 pt-3 sm:grid-cols-3">
                {copy.stats.map((item) => (
                  <div key={item.label} className="surface-card rounded-[24px] border-white/10 bg-white/10 px-4 py-4 text-center">
                    <div className="text-xl font-bold text-white md:text-2xl">{item.value}</div>
                    <div className="mt-1 text-xs text-secondary-foreground/70 md:text-sm">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative fade-up-in">
              <div className="relative mr-auto max-w-xl rounded-[32px] border border-white/14 bg-white/8 p-5 text-white shadow-heavy backdrop-blur-2xl md:p-7">
                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-primary">{copy.seasonKicker}</p>
                    <h3 className="mt-2 text-2xl font-bold text-white md:text-3xl">{copy.seasonTitle}</h3>
                  </div>
                  <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white/80">{copy.seasonTag}</span>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
                  <div className="relative min-h-[320px] overflow-hidden rounded-[28px] border border-white/10 shadow-medium">
                    <Image
                      src={secondaryHeroImage}
                      alt="أناقة فلويا"
                      fill
                      className="object-cover transition duration-700 hover:scale-[1.04]"
                      sizes="(max-width: 768px) 100vw, 420px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/18 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <div className="inline-flex rounded-full border border-white/20 bg-black/20 px-3 py-1 text-xs font-semibold text-white/88 backdrop-blur">
                        {copy.collectionTag}
                      </div>
                      <p className="mt-3 max-w-xs text-xl font-bold leading-8 text-white">
                        {copy.collectionText}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <div className="relative min-h-[152px] overflow-hidden rounded-[24px] border border-white/10">
                      <Image
                        src={tertiaryHeroImage}
                        alt="تفاصيل أنيقة"
                        fill
                        className="object-cover transition duration-700 hover:scale-[1.04]"
                        sizes="(max-width: 768px) 100vw, 220px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/12 to-transparent" />
                      <div className="absolute bottom-0 right-0 p-4">
                        <p className="text-sm font-bold text-white">{copy.touchText}</p>
                      </div>
                    </div>
                    <div className="grid min-h-[152px] gap-3 rounded-[24px] border border-white/10 bg-black/12 p-4 backdrop-blur-xl">
                      {copy.chips.map((item) => (
                        <div key={item.label} className="flex items-center justify-between rounded-[18px] border border-white/10 bg-white/8 px-4 py-3">
                          <span className="text-sm font-medium text-white/78">{item.label}</span>
                          <span className="text-base font-bold text-white">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
