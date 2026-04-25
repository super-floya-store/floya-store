import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">الصفحة غير موجودة</h2>
        <p className="text-muted-foreground">الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
        <Button asChild>
          <Link href="/">العودة للرئيسية</Link>
        </Button>
      </div>
    </div>
  )
}
