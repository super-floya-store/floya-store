'use client'

import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

interface AdminPageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}

export function AdminPageHeader({ eyebrow, title, description, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">{eyebrow}</p> : null}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{title}</h1>
          {description ? <p className="max-w-3xl text-sm text-muted-foreground md:text-base">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

interface AdminPanelProps {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function AdminPanel({ title, description, actions, children, className, contentClassName }: AdminPanelProps) {
  return (
    <Card className={cn('surface-card border-white/70 shadow-soft', className)}>
      {title || description || actions ? (
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            {title ? <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle> : null}
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </CardHeader>
      ) : null}
      <CardContent className={cn('space-y-4', contentClassName)}>{children}</CardContent>
    </Card>
  )
}

interface AdminStatCardProps {
  label: string
  value: ReactNode
  meta?: ReactNode
  icon?: LucideIcon
  tone?: 'default' | 'success' | 'warning' | 'danger'
}

const toneStyles = {
  default: 'bg-primary/10 text-primary ring-primary/15',
  success: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-100 text-amber-700 ring-amber-200',
  danger: 'bg-rose-100 text-rose-700 ring-rose-200',
}

export function AdminStatCard({ label, value, meta, icon: Icon, tone = 'default' }: AdminStatCardProps) {
  return (
    <Card className="surface-card border-white/70 shadow-soft">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="text-2xl font-bold tracking-tight text-secondary">{value}</div>
          {meta ? <div className="text-xs text-muted-foreground">{meta}</div> : null}
        </div>
        {Icon ? (
          <span className={cn('inline-flex h-11 w-11 items-center justify-center rounded-2xl ring-1', toneStyles[tone])}>
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </CardContent>
    </Card>
  )
}

interface AdminEmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function AdminEmptyState({ title, description, action }: AdminEmptyStateProps) {
  return (
    <div className="rounded-[24px] border border-dashed border-border bg-white/70 px-6 py-10 text-center shadow-soft">
      <div className="mx-auto max-w-xl space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </div>
  )
}

export function AdminToolbar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3 rounded-[24px] border border-border/70 bg-white/80 p-4 shadow-soft md:flex-row md:flex-wrap md:items-center md:justify-between', className)}>
      {children}
    </div>
  )
}
