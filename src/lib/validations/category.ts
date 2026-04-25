import { z } from 'zod'

export const categorySchema = z.object({
  name_ar: z
    .string()
    .min(2, 'الاسم العربي يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم العربي يجب أن لا يتجاوز 100 حرف'),
  name_en: z
    .string()
    .min(2, 'الاسم الإنجليزي يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم الإنجليزي يجب أن لا يتجاوز 100 حرف'),
  slug: z
    .string()
    .min(2, 'الرابط يجب أن يكون حرفين على الأقل')
    .max(100, 'الرابط يجب أن لا يتجاوز 100 حرف')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'الرابط يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط')
    .optional(),
  description_ar: z.string().max(1000).optional().nullable(),
  description_en: z.string().max(1000).optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  gallery_images: z.array(z.string().url()).max(12).default([]),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
  parent_id: z.string().uuid().optional().nullable(),
})

export const categoryUpdateSchema = categorySchema.partial()

export type CategoryInput = z.infer<typeof categorySchema>
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>
