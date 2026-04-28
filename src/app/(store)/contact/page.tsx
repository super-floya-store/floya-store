'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'

export default function ContactPage() {
  const locale = useUIStore((state) => state.locale)
  const [form, setForm] = useState({ customerName: '', customerEmail: '', customerPhone: '', subject: '', message: '' })
  const [settings, setSettings] = useState<any>(null)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const copy = locale === 'ar'
    ? {
        kicker: 'تواصل معنا',
        title: 'تواصل معنا',
        body: 'تواصل سريع وواضح مع فريق المتجر للحصول على المساعدة أو المتابعة.',
        info: 'معلومات التواصل',
        form: 'أرسل رسالة مباشرة',
        sent: 'تم إرسال رسالتك بنجاح.',
        failed: 'تعذر إرسال الرسالة.',
        name: 'الاسم',
        email: 'البريد الإلكتروني',
        phone: 'الهاتف',
        subject: 'الموضوع',
        content: 'اكتب رسالتك هنا',
        sending: 'جاري الإرسال...',
        submit: 'إرسال الرسالة',
        city: 'الجزائر العاصمة',
        hours: 'السبت - الخميس: 9:00 - 18:00',
      }
    : {
        kicker: 'Contact',
        title: 'Contact us',
        body: 'Reach the store team quickly for help, support, or order-related questions.',
        info: 'Contact details',
        form: 'Send a direct message',
        sent: 'Your message was sent successfully.',
        failed: 'Unable to send your message.',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        subject: 'Subject',
        content: 'Write your message here',
        sending: 'Sending...',
        submit: 'Send message',
        hours: 'Saturday - Thursday: 9:00 - 18:00',
      }

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSettings(data.data)
      })
      .catch(() => {})
  }, [])

  const address = typeof settings?.store_address === 'string' ? JSON.parse(settings.store_address) : (settings?.store_address || {})
  const infoCards = [
    {
      icon: Phone,
      label: locale === 'ar' ? 'الهاتف' : 'Phone',
      value: settings?.store_phone || '0555123456',
    },
    {
      icon: Mail,
      label: locale === 'ar' ? 'البريد الإلكتروني' : 'Email',
      value: settings?.store_email || 'contact@floya.dz',
    },
    {
      icon: MapPin,
      label: locale === 'ar' ? 'الموقع' : 'Location',
      value: locale === 'ar' ? (address?.ar || 'الجزائر') : (address?.en || 'Algeria'),
    },
    {
      icon: Clock,
      label: locale === 'ar' ? 'أوقات العمل' : 'Working hours',
      value: copy.hours,
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setMessage('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setForm({ customerName: '', customerEmail: '', customerPhone: '', subject: '', message: '' })
        setMessage(copy.sent)
      } else {
        setMessage(data.error?.message || copy.failed)
      }
    } catch {
      setMessage(copy.failed)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:px-6">
      <div className="mb-8 rounded-[34px] bg-gradient-to-br from-secondary via-brand-ink to-brand-night px-6 py-10 text-center text-secondary-foreground shadow-heavy md:px-8">
        <span className="section-kicker mx-auto w-fit border-white/10 bg-white/10 text-primary-foreground">{copy.kicker}</span>
        <h1 className="mt-4 text-3xl font-bold md:text-5xl">{copy.title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-secondary-foreground/76 md:text-base">
          {copy.body}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="surface-card rounded-[32px] border-white/70 shadow-soft">
          <CardHeader>
            <CardTitle>{copy.info}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {infoCards.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex min-h-[132px] flex-col items-center justify-center rounded-[24px] border border-border bg-white px-5 py-5 text-center shadow-soft">
                  <Icon className="h-6 w-6 text-primary" />
                  <p className="mt-3 text-xs font-semibold tracking-[0.2em] text-primary">{item.label}</p>
                  <p className="mt-2 text-base font-semibold text-secondary">{item.value}</p>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="surface-card rounded-[32px] border-white/70 shadow-soft">
          <CardHeader>
            <CardTitle>{copy.form}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder={copy.name} className="min-h-[46px] w-full rounded-2xl border border-border bg-white px-4 text-foreground" required />
              <input value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} placeholder={copy.email} className="min-h-[46px] w-full rounded-2xl border border-border bg-white px-4 text-foreground" />
              <input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} placeholder={copy.phone} className="min-h-[46px] w-full rounded-2xl border border-border bg-white px-4 text-foreground" />
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder={copy.subject} className="min-h-[46px] w-full rounded-2xl border border-border bg-white px-4 text-foreground" />
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={copy.content} className="min-h-[140px] w-full rounded-2xl border border-border bg-white px-4 py-3 text-foreground" required />
              <button type="submit" disabled={sending} className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-gradient-to-r from-primary to-brand-gold px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow transition duration-300 hover:-translate-y-0.5">
                {sending ? copy.sending : copy.submit}
              </button>
              {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
