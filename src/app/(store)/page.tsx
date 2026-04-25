import { HeroSection } from '@/components/store/HeroSection'
import { CategoryGrid } from '@/components/store/CategoryGrid'
import { FeaturedProducts } from '@/components/store/FeaturedProducts'

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10 pb-8 md:gap-14 md:pb-12">
      <HeroSection />
      <CategoryGrid />
      <FeaturedProducts />
    </div>
  )
}
