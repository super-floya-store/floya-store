'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'
import type { CommentEntityType, Comment } from '@/types/comment'

interface CommentsSectionProps {
  entityType: CommentEntityType
  entityId: string
  title?: string
}

export function CommentsSection({ entityType, entityId, title = 'آراء العملاء' }: CommentsSectionProps) {
  const locale = useUIStore((state) => state.locale)
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
  const copy = locale === 'ar'
    ? {
        defaultTitle: 'آراء العملاء',
        body: 'تعليقات حقيقية بعد مراجعة الإدارة للحفاظ على الجودة.',
        empty: 'لا توجد تعليقات منشورة بعد.',
        addTitle: 'أضف رأيك',
        name: 'الاسم',
        email: 'البريد الإلكتروني',
        rating: 'التقييم',
        comment: 'التعليق',
        submit: 'إرسال التعليق',
        submitting: 'جاري الإرسال...',
        success: 'تم استلام تعليقك وسيظهر بعد المراجعة.',
        error: 'تعذر إرسال التعليق.',
        stars: ['5 نجوم', '4 نجوم', '3 نجوم', 'نجمتان', 'نجمة واحدة'],
        localeTag: 'ar-DZ',
      }
    : {
        defaultTitle: 'Customer reviews',
        body: 'Real comments reviewed by the admin team before publication.',
        empty: 'No published comments yet.',
        addTitle: 'Add your review',
        name: 'Name',
        email: 'Email',
        rating: 'Rating',
        comment: 'Comment',
        submit: 'Submit review',
        submitting: 'Submitting...',
        success: 'Your review was received and will appear after moderation.',
        error: 'Unable to submit your review.',
        stars: ['5 stars', '4 stars', '3 stars', '2 stars', '1 star'],
        localeTag: 'en-US',
      }

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
        setMessage(copy.success)
      } else {
        setMessage(data.error?.message || copy.error)
      }
    } catch {
      setMessage(copy.error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="surface-card rounded-[30px] p-6">
        <h2 className="text-2xl font-bold text-foreground">{title === 'آراء العملاء' ? copy.defaultTitle : title}</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{copy.body}</p>

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
                    <p className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleDateString(copy.localeTag)}</p>
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
              {copy.empty}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="surface-card rounded-[30px] p-6">
        <h3 className="text-xl font-bold text-foreground">{copy.addTitle}</h3>
        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <label htmlFor="comment-name" className="text-sm font-medium text-foreground">{copy.name}</label>
            <input
              id="comment-name"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="min-h-[48px] w-full rounded-2xl border border-border bg-white px-4 text-foreground outline-none transition focus:border-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="comment-email" className="text-sm font-medium text-foreground">{copy.email}</label>
            <input
              id="comment-email"
              type="email"
              value={form.customerEmail}
              onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
              className="min-h-[48px] w-full rounded-2xl border border-border bg-white px-4 text-foreground outline-none transition focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="comment-rating" className="text-sm font-medium text-foreground">{copy.rating}</label>
            <select
              id="comment-rating"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
              className="min-h-[48px] w-full rounded-2xl border border-border bg-white px-4 text-foreground outline-none transition focus:border-primary"
            >
              <option value="5">{copy.stars[0]}</option>
              <option value="4">{copy.stars[1]}</option>
              <option value="3">{copy.stars[2]}</option>
              <option value="2">{copy.stars[3]}</option>
              <option value="1">{copy.stars[4]}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="comment-body" className="text-sm font-medium text-foreground">{copy.comment}</label>
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
            {submitting ? copy.submitting : copy.submit}
          </Button>
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </div>
      </form>
    </section>
  )
}
