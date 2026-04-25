import { z } from 'zod'

export const productSchema = z.object({
  name_ar: z
    .string()
    .min(3, 'الاسم العربي يجب أن يكون 3 أحرف على الأقل')
    .max(200, 'الاسم العربي يجب أن لا يتجاوز 200 حرف'),
  name_en: z
    .string()
    .min(3, 'الاسم الإنجليزي يجب أن يكون 3 أحرف على الأقل')
    .max(200, 'الاسم الإنجليزي يجب أن لا يتجاوز 200 حرف'),
  description_ar: z.string().max(2000, 'الوصف العربي يجب أن لا يتجاوز 2000 حرف').optional().nullable(),
  description_en: z.string().max(2000, 'الوصف الإنجليزي يجب أن لا يتجاوز 2000 حرف').optional().nullable(),
  price: z
    .number()
    .positive('السعر يجب أن يكون موجباً')
    .max(9999999.99, 'السعر يجب أن لا يتجاوز 9,999,999.99'),
  promo_price: z
    .number()
    .positive('سعر التخفيض يجب أن يكون موجباً')
    .optional()
    .nullable(),
  category_id: z.string().uuid('يجب اختيار فئة صالحة'),
  images: z.array(z.string().url()).max(10, 'الحد الأقصى 10 صور').default([]),
  stock_quantity: z.number().int().min(0, 'الكمية يجب أن تكون 0 أو أكثر').default(0),
  is_published: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  weight: z.number().positive().optional().nullable(),
  tags: z.array(z.string().max(50)).max(20, 'الحد الأقصى 20 وسوم').default([]),
  seo_title: z.string().max(60).optional().nullable(),
  seo_description: z.string().max(160).optional().nullable(),
  supplier_id: z.string().uuid().optional().nullable(),
  low_stock_threshold: z.number().int().min(0).max(999).default(3),
})

export const productUpdateSchema = productSchema.partial()

export type ProductInput = z.infer<typeof productSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
