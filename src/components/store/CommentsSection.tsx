'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { CommentEntityType, Comment } from '@/types/comment'

interface CommentsSectionProps {
  entityType: CommentEntityType
  entityId: string
  title?: string
}

export function CommentsSection({ entityType, entityId, title = 'آراء العملاء' }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    rating: '5',
    comment: '',
  })

  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch(`/api/comments?entityType=${entityType}&entityId=${entityId}`)
        const data = await res.json()
        if (data.success) {
          setComments(data.data)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [entityType, entityId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          customerName: form.customerName,
          customerEmail: form.customerEmail || null,
          rating: parseInt(form.rating),
          comment: form.comment,
        }),
      })
      const data = await res.json()

      if (data.success) {
        setForm({
          customerName: '',
          customerEmail: '',
          rating: '5',
          comment: '',
        })
        setMessage('تم استلام تعليقك وسيظهر بعد المراجعة.')
      } else {
        setMessage(data.error?.message || 'تعذر إرسال التعليق.')
      }
    } catch {
      setMessage('تعذر إرسال التعليق.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="surface-card rounded-[30px] p-6">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">تعليقات حقيقية بعد مراجعة الإدارة للحفاظ على الجودة.</p>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="shimmer-surface h-24 rounded-[24px]" />
              ))}
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-[24px] border border-border/80 bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-foreground">{comment.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleDateString('ar-DZ')}</p>
                  </div>
                  <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    {'★'.repeat(comment.rating)}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-8 text-foreground/85">{comment.comment}</p>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
              لا توجد تعليقات منشورة بعد.
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="surface-card rounded-[30px] p-6">
        <h3 className="text-xl font-bold text-foreground">أضيفي رأيك</h3>
        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <label htmlFor="comment-name" className="text-sm font-medium text-foreground">الاسم</label>
            <input
              id="comment-name"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="min-h-[48px] w-full rounded-2xl border border-border bg-white px-4 text-foreground outline-none transition focus:border-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="comment-email" className="text-sm font-medium text-foreground">البريد الإلكتروني</label>
            <input
              id="comment-email"
              type="email"
              value={form.customerEmail}
              onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
              className="min-h-[48px] w-full rounded-2xl border border-border bg-white px-4 text-foreground outline-none transition focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="comment-rating" className="text-sm font-medium text-foreground">التقييم</label>
            <select
              id="comment-rating"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
              className="min-h-[48px] w-full rounded-2xl border border-border bg-white px-4 text-foreground outline-none transition focus:border-primary"
            >
              <option value="5">5 نجوم</option>
              <option value="4">4 نجوم</option>
              <option value="3">3 نجوم</option>
              <option value="2">2 نجوم</option>
              <option value="1">نجمة واحدة</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="comment-body" className="text-sm font-medium text-foreground">التعليق</label>
            <textarea
              id="comment-body"
              rows={5}
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-foreground outline-none transition focus:border-primary"
              required
            />
          </div>
          <Button type="submit" className="min-h-[48px] w-full rounded-full" disabled={submitting}>
            {submitting ? 'جاري الإرسال...' : 'إرسال التعليق'}
          </Button>
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </div>
      </form>
    </section>
  )
}
