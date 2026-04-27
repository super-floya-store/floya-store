export interface CustomerProfile {
  id: string
  user_id: string | null
  phone: string
  email: string | null
  full_name: string | null
  notes: string | null
  is_blacklisted: boolean
  is_vip: boolean
  fraud_flags: number
  last_order_at: string | null
  created_at: string
  updated_at: string
}
