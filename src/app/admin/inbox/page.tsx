'use client'

import { useEffect, useMemo, useState } from 'react'
import { Mail, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useUIStore } from '@/stores/ui-store'
import { formatDate, formatNumber } from '@/lib/utils/format'
import { AdminEmptyState, AdminPageHeader, AdminPanel, AdminToolbar } from '@/components/admin/AdminShell'

interface ContactMessage {
  id: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  subject: string | null
  message: string
  status: 'new' | 'in_progress' | 'resolved' | 'archived'
  created_at: string
}

export default function AdminInboxPage() {
  const locale = useUIStore((state) => state.locale)
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | ContactMessage['status']>('all')
  const [query, setQuery] = useState('')
  const copy = locale === 'ar'
    ? {
        eyebrow: 'رسائل المتجر',
        title: 'البريد الوارد',
        subtitle: 'متابعة رسائل الموقع وتحويلها بين الحالات حتى تتم المعالجة أو الأرشفة.',
        search: 'ابحث بالاسم أو البريد أو الموضوع',
        all: 'الكل',
        new: 'جديدة',
        inProgress: 'قيد المتابعة',
        resolved: 'تمت المعالجة',
        archived: 'مؤرشفة',
        noSubject: 'بدون عنوان',
        noMessages: 'لا توجد رسائل حالياً.',
        noMessagesDescription: 'عند وصول رسائل جديدة ستظهر هنا للمراجعة والمتابعة.',
      }
    : {
        eyebrow: 'Store communications',
        title: 'Inbox',
        subtitle: 'Review store contact messages and move them through operational statuses until resolved or archived.',
        search: 'Search by name, email, or subject',
        all: 'All',
        new: 'New',
        inProgress: 'In progress',
        resolved: 'Resolved',
        archived: 'Archived',
        noSubject: 'No subject',
        noMessages: 'There are no messages right now.',
        noMessagesDescription: 'New contact messages will appear here for review and follow-up.',
      }

  useEffect(() => {
    fetch('/api/contact')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMessages(data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id: string, status: ContactMessage['status']) => {
    const res = await fetch(`/api/contact/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data = await res.json()
    if (data.success) {
      setMessages((current) => current.map((item) => (item.id === id ? data.data : item)))
    }
  }

  const filteredMessages = useMemo(() => {
    return messages.filter((message) => {
      const matchesStatus = statusFilter === 'all' || message.status === statusFilter
      const normalized = query.toLowerCase().trim()
      const matchesQuery = !normalized || [message.customer_name, message.customer_email || '', message.subject || '']
        .some((value) => value.toLowerCase().includes(normalized))
      return matchesStatus && matchesQuery
    })
  }, [messages, statusFilter, query])

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
              { value: 'new', label: copy.new },
              { value: 'in_progress', label: copy.inProgress },
              { value: 'resolved', label: copy.resolved },
              { value: 'archived', label: copy.archived },
            ].map((item) => (
              <button key={item.value} onClick={() => setStatusFilter(item.value as typeof statusFilter)} className={`rounded-full px-4 py-2 text-sm ${statusFilter === item.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {formatNumber(filteredMessages.length, locale)} / {formatNumber(messages.length, locale)}
        </div>
      </AdminToolbar>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 rounded-[24px]" />
          <Skeleton className="h-32 rounded-[24px]" />
        </div>
      ) : filteredMessages.length ? (
        <div className="grid gap-4">
          {filteredMessages.map((message) => (
            <AdminPanel key={message.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{formatDate(message.created_at, locale)}</span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-foreground">{message.customer_name}</h2>
                  <p className="text-sm text-muted-foreground">{message.customer_email || '-'} • {message.customer_phone || '-'}</p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">{message.status}</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">{message.subject || copy.noSubject}</p>
                <p className="text-sm leading-8 text-muted-foreground">{message.message}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => updateStatus(message.id, 'in_progress')}>{copy.inProgress}</Button>
                <Button size="sm" onClick={() => updateStatus(message.id, 'resolved')}>{copy.resolved}</Button>
                <Button size="sm" variant="ghost" onClick={() => updateStatus(message.id, 'archived')}>{copy.archived}</Button>
              </div>
            </AdminPanel>
          ))}
        </div>
      ) : (
        <AdminEmptyState title={copy.noMessages} description={copy.noMessagesDescription} />
      )}
    </div>
  )
}
