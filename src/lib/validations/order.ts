import { z } from 'zod'

const algerianPhoneRegex = /^0[5-7][0-9]{8}$/

export const orderSchema = z.object({
  customerName: z
    .string()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم يجب أن لا يتجاوز 100 حرف'),
  customerPhone: z
    .string()
    .regex(algerianPhoneRegex, 'رقم الهاتف يجب أن يكون بالتنسيق الجزائري (0XXXXXXXXX)'),
  customerEmail: z.string().email('بريد إلكتروني غير صالح').optional().nullable(),
  wilaya: z.string().min(1, 'الولاية مطلوبة'),
  commune: z
    .string()
    .min(2, 'البلدية يجب أن تكون حرفين على الأقل')
    .max(100, 'البلدية يجب أن لا يتجاوز 100 حرف'),
  deliveryAddress: z
    .string()
    .min(10, 'عنوان التوصيل يجب أن يكون 10 أحرف على الأقل')
    .max(500, 'عنوان التوصيل يجب أن لا يتجاوز 500 حرف'),
  notes: z.string().max(500).optional().nullable(),
  paymentMethod: z.enum(['baridimob', 'cod', 'binance']),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, 'يجب أن يحتوي الطلب على منتج واحد على الأقل')
    .max(50, 'الحد الأقصى 50 منتج'),
})

export const orderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
  trackingNumber: z.string().optional().nullable(),
  cancelledReason: z.string().min(10).max(500).optional().nullable(),
  paymentStatus: z.enum(['pending', 'submitted', 'paid', 'rejected', 'failed', 'refunded']).optional(),
  paymentReviewNotes: z.string().max(500).optional().nullable(),
  estimatedDeliveryDays: z.number().int().min(0).max(60).optional().nullable(),
  estimatedDeliveryDate: z.string().optional().nullable(),
  followUpMessage: z.string().max(1200).optional().nullable(),
})

export type OrderInput = z.infer<typeof orderSchema>
export type OrderStatusInput = z.infer<typeof orderStatusSchema>
