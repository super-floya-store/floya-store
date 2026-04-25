'use client'

import { useUIStore } from '@/stores/ui-store'

export default function ReturnsPage() {
  const locale = useUIStore((state) => state.locale)
  const copy = locale === 'ar'
    ? {
        kicker: 'الإرجاع والاستبدال',
        title: 'سياسة واضحة ومطمئنة',
        points: [
          'يمكن طلب الاستبدال أو الإرجاع خلال مدة محددة حسب نوع المنتج وحالته عند الاستلام.',
          'يشترط أن يكون المنتج في حالته الأصلية مع التغليف الكامل وألا يكون قد تعرض لاستخدام يؤثر على بيعه مرة أخرى.',
          'في حال وجود مشكلة في الطلب، يرجى التواصل معنا مباشرة مع رقم الطلب وصور توضح الحالة لتسريع المعالجة.',
        ],
      }
    : {
        kicker: 'Returns and exchanges',
        title: 'A clear and reassuring policy',
        points: [
          'You can request an exchange or return within the allowed period, depending on the product type and condition on arrival.',
          'The product must remain in its original condition with full packaging and without use that affects resale.',
          'If there is an issue with the order, contact us directly with the order number and photos showing the issue so we can process it faster.',
        ],
      }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 md:px-6">
      <div className="surface-card rounded-[32px] p-8">
        <span className="section-kicker">{copy.kicker}</span>
        <h1 className="section-title mt-4">{copy.title}</h1>
        <div className="mt-8 space-y-4 text-sm leading-8 text-muted-foreground">
          {copy.points.map((point) => (
            <p key={point}>{point}</p>
          ))}
        </div>
      </div>
    </div>
  )
}
