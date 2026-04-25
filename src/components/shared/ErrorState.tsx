import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({ title = 'حدث خطأ', message = 'نأسف لذلك. يرجى المحاولة مرة أخرى.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      {onRetry && <Button onClick={onRetry}>إعادة المحاولة</Button>}
    </div>
  )
}
