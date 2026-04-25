import { z } from 'zod'

export const supplierSchema = z.object({
  name: z.string().min(2).max(120),
  contact_name: z.string().max(120).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  email: z.string().email().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
})

export const supplierUpdateSchema = supplierSchema.partial()
