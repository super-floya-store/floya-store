import { z } from 'zod'

const productVariantSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z.string().max(120).optional().nullable(),
  size: z.string().max(50).optional().nullable(),
  color: z.string().max(80).optional().nullable(),
  name_ar: z.string().max(200).optional().nullable(),
  name_en: z.string().max(200).optional().nullable(),
  price_override: z.number().nonnegative().optional().nullable(),
  promo_price_override: z.number().nonnegative().optional().nullable(),
  stock_quantity: z.number().int().min(0).default(0),
  low_stock_threshold: z.number().int().min(0).max(999).default(3),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
})

const digitalInventoryUnitSchema = z.object({
  id: z.string().uuid().optional(),
  variant_id: z.string().uuid().optional().nullable(),
  title: z.string().max(200).optional().nullable(),
  payload: z.string().min(1, 'بيانات التسليم مطلوبة'),
  status: z.enum(['available', 'reserved', 'delivered', 'revoked']).optional(),
})

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
  product_type: z.enum(['physical_simple', 'physical_variant', 'digital_account']).default('physical_simple'),
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
  variants: z.array(productVariantSchema).default([]),
  digital_inventory_units: z.array(digitalInventoryUnitSchema).default([]),
})

export const productUpdateSchema = productSchema.partial()

export type ProductInput = z.infer<typeof productSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
