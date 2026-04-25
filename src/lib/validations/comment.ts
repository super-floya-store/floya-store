import { z } from 'zod'

export const commentSchema = z.object({
  entityType: z.enum(['product', 'category']),
  entityId: z.string().uuid(),
  customerName: z.string().min(2, 'الاسم مطلوب').max(100),
  customerEmail: z.string().email('البريد الإلكتروني غير صالح').optional().nullable(),
  rating: z.number().int().min(1).max(5).default(5),
  comment: z.string().min(5, 'أضيف تعليقاً أوضح').max(1200),
})

export const commentModerationSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  adminNotes: z.string().max(1200).optional().nullable(),
})
