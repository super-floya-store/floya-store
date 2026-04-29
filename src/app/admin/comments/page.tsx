'use client'

import { useEffect, useMemo, useState } from 'react'
import { MessageSquare, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Comment } from '@/types/comment'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/stores/ui-store'
import { AdminEmptyState, AdminPageHeader, AdminPanel, AdminToolbar } from '@/components/admin/AdminShell'

export default function AdminCommentsPage() {
  const locale = useUIStore((state) => state.locale)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | Comment['status']>('all')
  const [query, setQuery] = useState('')
  const copy = locale === 'ar'
    ? {
        eyebrow: 'إدارة المحتوى',
        title: 'التعليقات',
        subtitle: 'مراجعة تعليقات العملاء وقبولها أو رفضها قبل النشر أو إعادتها للمراجعة.',
        product: 'منتج',
        category: 'فئة',
        rejected: 'مرفوض',
        noEmail: 'بدون بريد إلكتروني',
        approve: 'قبول',
        reject: 'رفض',
        backToPending: 'إعادة للمراجعة',
        empty: 'لا توجد تعليقات حالياً.',
        emptyDescription: 'عند وصول تعليقات جديدة ستظهر هنا للمراجعة.',
        search: 'ابحث بالاسم أو التعليق أو البريد',
        all: 'الكل',
        pending: 'معلقة',
        approved: 'مقبولة',
      }
    : {
        eyebrow: 'Content moderation',
        title: 'Comments',
        subtitle: 'Review customer comments and approve, reject, or return them to pending before publishing.',
        product: 'Product',
        category: 'Category',
        rejected: 'Rejected',
        noEmail: 'No email provided',
        approve: 'Approve',
        reject: 'Reject',
        backToPending: 'Return to pending',
        empty: 'There are no comments right now.',
        emptyDescription: 'New comments will appear here for moderation.',
        search: 'Search by name, comment, or email',
        all: 'All',
        pending: 'Pending',
        approved: 'Approved',
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

  const filteredComments = useMemo(() => {
    return comments.filter((comment) => {
      const matchesStatus = statusFilter === 'all' || comment.status === statusFilter
      const normalized = query.toLowerCase().trim()
      const matchesQuery = !normalized || [comment.customer_name, comment.customer_email || '', comment.comment]
        .some((value) => value.toLowerCase().includes(normalized))
      return matchesStatus && matchesQuery
    })
  }, [comments, statusFilter, query])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-[24px]" />
        <Skeleton className="h-40 w-full rounded-[24px]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.subtitle} />

      <AdminToolbar>
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:flex-wrap">
          <label className="relative min-w-[260px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.search}
              className="h-11 w-full rounded-full border border-border bg-white pl-10 pr-4 text-sm text-foreground shadow-soft outline-none"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: copy.all },
              { value: 'pending', label: copy.pending },
              { value: 'approved', label: copy.approved },
              { value: 'rejected', label: copy.rejected },
            ].map((item) => (
              <button key={item.value} onClick={() => setStatusFilter(item.value as typeof statusFilter)} className={`rounded-full px-4 py-2 text-sm ${statusFilter === item.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </AdminToolbar>

      <div className="grid gap-4">
        {filteredComments.map((comment) => (
          <AdminPanel key={comment.id} className={cn(comment.status === 'rejected' && 'border-destructive/30 bg-destructive/5')}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>{comment.entity_type === 'product' ? copy.product : copy.category}</span>
                  <span>•</span>
                  <span>{comment.status === 'rejected' ? copy.rejected : comment.status}</span>
                </div>
                <div>
                  <h2 className={cn('text-lg font-semibold text-foreground', comment.status === 'rejected' && 'line-through decoration-destructive decoration-2 opacity-70')}>
                    {comment.customer_name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{comment.customer_email || copy.noEmail} • {comment.rating}/5</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" disabled={savingId === comment.id} onClick={() => updateComment(comment.id, 'approved')}>{copy.approve}</Button>
                <Button size="sm" variant="outline" disabled={savingId === comment.id} onClick={() => updateComment(comment.id, 'rejected')}>{copy.reject}</Button>
                <Button size="sm" variant="ghost" disabled={savingId === comment.id} onClick={() => updateComment(comment.id, 'pending')}>{copy.backToPending}</Button>
              </div>
            </div>
            <p className={cn('leading-8 text-foreground', comment.status === 'rejected' && 'line-through decoration-destructive decoration-2 opacity-70')}>
              {comment.comment}
            </p>
          </AdminPanel>
        ))}
        {filteredComments.length === 0 && (
          <AdminEmptyState title={copy.empty} description={copy.emptyDescription} />
        )}
      </div>
    </div>
  )
}
