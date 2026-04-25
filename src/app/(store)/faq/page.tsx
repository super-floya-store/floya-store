export default function FaqPage() {
  const faqs = [
    ['كيف يتم تأكيد الطلب؟', 'بعد إنشاء الطلب ورفع وصل الدفع عبر BaridiMob تقوم الإدارة بمراجعة العملية ثم تأكيد الطلب.'],
    ['كم مدة التوصيل؟', 'عادة بين 24 و72 ساعة حسب الولاية وتوفر الشحن.'],
    ['كيف أتابع طلبي؟', 'من صفحة الطلب التي تظهر لك بعد إتمام الشراء، ويتم تحديث الحالة مباشرة بعد مراجعة الدفع والشحن.'],
    ['هل يمكنني استبدال أو إرجاع المنتج؟', 'نعم حسب حالة المنتج وسياسة الإرجاع الموضحة في صفحة الإرجاع.'],
  ]

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 md:px-6">
      <div className="surface-card rounded-[32px] p-8">
        <span className="section-kicker">الأسئلة الشائعة</span>
        <h1 className="section-title mt-4">كل ما يحتاجه العميل قبل الطلب</h1>
        <div className="mt-8 space-y-4">
          {faqs.map(([question, answer]) => (
            <div key={question} className="rounded-[24px] border border-border bg-white/70 p-5">
              <h2 className="font-bold text-foreground">{question}</h2>
              <p className="mt-3 text-sm leading-8 text-muted-foreground">{answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
