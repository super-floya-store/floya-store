'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

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
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">رسائل الموقع</h1>
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <div className="grid gap-4">
          {messages.map((message) => (
            <div key={message.id} className="rounded-lg border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold">{message.customer_name}</h2>
                  <p className="text-sm text-muted-foreground">{message.customer_email || '-'} • {message.customer_phone || '-'}</p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs">{message.status}</span>
              </div>
              <p className="mt-2 text-sm font-medium">{message.subject || 'بدون عنوان'}</p>
              <p className="mt-3 text-sm leading-8 text-muted-foreground">{message.message}</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => updateStatus(message.id, 'in_progress')}>قيد المتابعة</Button>
                <Button size="sm" onClick={() => updateStatus(message.id, 'resolved')}>تمت المعالجة</Button>
                <Button size="sm" variant="ghost" onClick={() => updateStatus(message.id, 'archived')}>أرشفة</Button>
              </div>
            </div>
          ))}
          {messages.length === 0 && <div className="rounded-lg border bg-card px-6 py-10 text-center text-muted-foreground">لا توجد رسائل حالياً.</div>}
        </div>
      )}
    </div>
  )
}
