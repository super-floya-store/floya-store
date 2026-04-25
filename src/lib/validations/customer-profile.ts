import { z } from 'zod'

export const customerProfileUpdateSchema = z.object({
  notes: z.string().max(2000).optional().nullable(),
  is_blacklisted: z.boolean().optional(),
  is_vip: z.boolean().optional(),
  fraud_flags: z.number().int().min(0).max(99).optional(),
})
