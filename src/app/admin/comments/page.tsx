'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Comment } from '@/types/comment'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/stores/ui-store'

export default function AdminCommentsPage() {
  const locale = useUIStore((state) => state.locale)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const copy = locale === 'ar'
    ? {
        title: 'التعليقات',
        subtitle: 'مراجعة تعليقات العملاء وقبولها أو رفضها قبل النشر.',
        product: 'منتج',
        category: 'فئة',
        rejected: 'مرفوض',
        noEmail: 'بدون بريد إلكتروني',
        approve: 'قبول',
        reject: 'رفض',
        backToPending: 'إعادة للمراجعة',
        empty: 'لا توجد تعليقات حالياً.',
      }
    : {
        title: 'Comments',
        subtitle: 'Review customer comments and approve or reject them before publishing.',
        product: 'Product',
        category: 'Category',
        rejected: 'Rejected',
        noEmail: 'No email provided',
        approve: 'Approve',
        reject: 'Reject',
        backToPending: 'Return to pending',
        empty: 'There are no comments right now.',
      }

  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch('/api/comments?includePending=true')
        const data = await res.json()
        if (data.success) setComments(data.data)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [])

  const updateComment = async (id: string, status: Comment['status']) => {
    setSavingId(id)
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (data.success) {
        setComments((current) => current.map((comment) => (comment.id === id ? data.data : comment)))
      }
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{copy.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>

      <div className="grid gap-4">
        {comments.map((comment) => (
          <Card key={comment.id} className={cn(comment.status === 'rejected' && 'border-destructive/30 bg-destructive/5')}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-4 text-lg">
                <span className={cn(comment.status === 'rejected' && 'line-through decoration-destructive decoration-2 opacity-70')}>
                  {comment.customer_name}
                </span>
                <span className={cn('text-sm font-medium', comment.status === 'rejected' ? 'text-destructive' : 'text-muted-foreground')}>
                  {comment.entity_type === 'product' ? copy.product : copy.category} • {comment.status === 'rejected' ? copy.rejected : comment.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{comment.customer_email || copy.noEmail} • {comment.rating}/5</p>
              <p className={cn('leading-8', comment.status === 'rejected' && 'line-through decoration-destructive decoration-2 opacity-70')}>
                {comment.comment}
              </p>
              <div className="flex gap-3">
                <Button size="sm" disabled={savingId === comment.id} onClick={() => updateComment(comment.id, 'approved')}>{copy.approve}</Button>
                <Button size="sm" variant="outline" disabled={savingId === comment.id} onClick={() => updateComment(comment.id, 'rejected')}>{copy.reject}</Button>
                <Button size="sm" variant="ghost" disabled={savingId === comment.id} onClick={() => updateComment(comment.id, 'pending')}>{copy.backToPending}</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {comments.length === 0 && (
          <div className="rounded-lg border bg-card px-6 py-10 text-center text-muted-foreground">
            {copy.empty}
          </div>
        )}
      </div>
    </div>
  )
}
