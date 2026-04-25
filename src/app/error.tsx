'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-destructive">حدث خطأ</h1>
        <p className="text-muted-foreground">نأسف لذلك. يرجى المحاولة مرة أخرى.</p>
        <Button onClick={reset}>إعادة المحاولة</Button>
      </div>
    </div>
  )
}
