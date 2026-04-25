'use client'

import Link from 'next/link'
import { ShoppingCart, Search, Menu, X, Heart } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { useUIStore } from '@/stores/ui-store'
import { useEffect, useState } from 'react'
import { useWishlistStore } from '@/stores/wishlist-store'

export function StoreHeader() {
  const hasHydrated = useCartStore((s) => s.hasHydrated)
  const totalItems = useCartStore((s) => s.totalItems())
  const wishlistCount = useWishlistStore((s) => s.items.length)
  const toggleCart = useUIStore((s) => s.toggleCartDrawer)
  const locale = useUIStore((s) => s.locale)
  const setLocale = useUIStore((s) => s.setLocale)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const copy = locale === 'ar'
    ? {
        products: 'المنتجات',
        arrivals: 'وصل حديثاً',
        contact: 'تواصل معنا',
        search: 'بحث',
        wishlist: 'المفضلة',
        cart: 'سلة التسوق',
        menu: 'القائمة',
        signIn: 'تسجيل الدخول',
        signUp: 'إنشاء حساب',
        switchLabel: 'AR / EN',
        switchTitle: 'English',
        mobileTitle: 'تسوق أنيق وواضح',
        mobileBody: 'اكتشفي منتجات واضحة التفاصيل وصوراً أجمل وتجربة شراء أسرع.',
        mobileCta: 'ابدئي التسوق الآن',
      }
    : {
        products: 'Products',
        arrivals: 'New Arrivals',
        contact: 'Contact',
        search: 'Search',
        wishlist: 'Wishlist',
        cart: 'Cart',
        menu: 'Menu',
        signIn: 'Sign in',
        signUp: 'Create account',
        switchLabel: 'AR / EN',
        switchTitle: 'العربية',
        mobileTitle: 'Clean, premium shopping',
        mobileBody: 'Discover clear products, better imagery, and a faster buying journey.',
        mobileCta: 'Start shopping',
      }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          isScrolled
            ? 'border-b border-white/60 bg-background/75 shadow-soft backdrop-blur-2xl'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-[78px] items-center justify-between gap-3">
            <Link
              href="/"
              className="surface-card premium-outline relative inline-flex min-h-[48px] items-center rounded-full px-4 py-2 text-secondary transition duration-300 hover:-translate-y-0.5 hover:shadow-medium"
            >
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 via-transparent to-secondary/10" />
              <span className="relative flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground shadow-soft">
                  F
                </span>
                <span className="flex flex-col leading-none">
                  <span className="text-sm font-semibold tracking-[0.24em] text-primary">FLOYA</span>
                  <span className="mt-1 text-base font-bold">فلويا ستور</span>
                </span>
              </span>
            </Link>

            <nav className="hidden items-center gap-2 lg:flex">
              {[
                { href: '/products', label: copy.products },
                { href: '/categories/new-arrivals', label: copy.arrivals },
                { href: '/contact', label: copy.contact },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative inline-flex min-h-[48px] items-center justify-center rounded-full px-5 py-3 text-sm font-medium text-secondary transition duration-300 hover:bg-white/60 hover:text-primary"
                >
                  {item.label}
                  <span className="absolute bottom-2 right-5 h-[2px] w-0 rounded-full bg-primary transition-all duration-300 group-hover:w-[calc(100%-2.5rem)]" />
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 md:gap-3">
              <Link
                href="/login"
                className="surface-card premium-outline hidden min-h-[48px] items-center justify-center rounded-full px-4 text-xs font-semibold text-secondary transition duration-300 hover:-translate-y-0.5 hover:text-primary hover:shadow-soft md:inline-flex"
              >
                {copy.signIn}
              </Link>
              <Link
                href="/signup"
                className="surface-card premium-outline hidden min-h-[48px] items-center justify-center rounded-full px-4 text-xs font-semibold text-secondary transition duration-300 hover:-translate-y-0.5 hover:text-primary hover:shadow-soft md:inline-flex"
              >
                {copy.signUp}
              </Link>
              <Link
                href="/search"
                className="surface-card premium-outline hidden min-h-[48px] min-w-[48px] items-center justify-center rounded-full text-secondary transition duration-300 hover:-translate-y-0.5 hover:text-primary hover:shadow-soft md:inline-flex"
                aria-label={copy.search}
              >
                <Search className="h-5 w-5" />
              </Link>
              <Link
                href="/products"
                className="surface-card premium-outline relative hidden min-h-[48px] min-w-[48px] items-center justify-center rounded-full text-secondary transition duration-300 hover:-translate-y-0.5 hover:text-primary hover:shadow-soft md:inline-flex"
                aria-label={copy.wishlist}
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{wishlistCount}</span>}
              </Link>

              <button
                onClick={toggleCart}
                className="surface-card premium-outline relative inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full text-secondary transition duration-300 hover:-translate-y-0.5 hover:text-primary hover:shadow-soft"
                aria-label={copy.cart}
              >
                <ShoppingCart className="h-5 w-5" />
                {hasHydrated && totalItems > 0 && (
                  <span className="badge-bounce absolute -right-1 -top-1 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-brand-gold px-1.5 text-xs font-bold text-primary-foreground shadow-glow">
                    {totalItems}
                  </span>
                )}
              </button>

              <button
                className="surface-card premium-outline inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full text-secondary transition duration-300 hover:-translate-y-0.5 hover:text-primary hover:shadow-soft lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={copy.menu}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <button
                type="button"
                onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
                className="surface-card premium-outline inline-flex min-h-[48px] items-center justify-center rounded-full px-4 text-xs font-bold tracking-[0.2em] text-secondary transition duration-300 hover:-translate-y-0.5 hover:text-primary hover:shadow-soft"
                aria-label={copy.switchTitle}
              >
                <span className="whitespace-nowrap">{copy.switchLabel}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-secondary/30 backdrop-blur-md transition duration-300 lg:hidden ${
          mobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside
        className={`premium-scrollbar fixed bottom-0 top-0 z-50 w-[86vw] max-w-sm overflow-y-auto bg-white/92 p-5 shadow-heavy backdrop-blur-2xl transition-transform duration-500 lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } right-0`}
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-[0.24em] text-primary">FLOYA STORE</span>
            <span className="mt-1 text-lg font-bold text-secondary">تسوق أنيق وواضح</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full bg-secondary text-secondary-foreground"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-3">
          {[
            { href: '/', label: 'الرئيسية' },
            { href: '/products', label: 'المنتجات' },
            { href: '/categories/new-arrivals', label: 'وصل حديثاً' },
            { href: '/search', label: 'البحث' },
            { href: '/contact', label: 'تواصل معنا' },
            { href: '/login', label: copy.signIn },
            { href: '/signup', label: copy.signUp },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="surface-card premium-outline inline-flex min-h-[52px] items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-secondary transition duration-300 hover:border-primary/30 hover:text-primary hover:shadow-soft"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>{item.label}</span>
              <span className="text-primary/70">←</span>
            </Link>
          ))}
        </nav>

        <div className="mt-8 rounded-[28px] bg-gradient-to-br from-secondary via-brand-ink to-brand-night p-5 text-secondary-foreground shadow-heavy">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary/90">جاهز للتسوق</p>
          <h3 className="mt-3 text-2xl font-bold leading-relaxed">{copy.mobileTitle}</h3>
          <p className="mt-3 text-sm leading-8 text-white/85">{copy.mobileBody}</p>
          <Link
            href="/products"
            className="glow-pulse mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition duration-300"
            onClick={() => setMobileMenuOpen(false)}
          >
            {copy.mobileCta}
          </Link>
        </div>
      </aside>
    </>
  )
}
