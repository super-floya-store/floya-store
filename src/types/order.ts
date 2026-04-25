export type OrderStatus = 'pending' | 'submitted' | 'payment_submitted' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentMethod = 'baridimob' | 'cod' | 'binance'
export type PaymentStatus = 'pending' | 'submitted' | 'paid' | 'rejected' | 'failed' | 'refunded'

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  wilaya: string
  commune: string
  delivery_address: string
  notes: string | null
  status: OrderStatus
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  payment_transaction_id: string | null
  payment_receipt_url: string | null
  payment_submitted_at: string | null
  payment_reviewed_at: string | null
  payment_review_notes: string | null
  estimated_delivery_days: number | null
  estimated_delivery_date: string | null
  follow_up_message: string | null
  subtotal: number
  delivery_fee: number
  total: number
  tracking_number: string | null
  confirmed_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
  cancelled_reason: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name_ar: string
  product_name_en: string
  product_image: string | null
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface OrderWithItems extends Order {
  items: OrderItem[]
}

export interface OrderFilter {
  page?: number
  limit?: number
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  search?: string
  wilaya?: string
  dateFrom?: string
  dateTo?: string
  sort?: 'newest' | 'oldest' | 'total_asc' | 'total_desc'
}

export interface OrderFollowUpUpdate {
  estimatedDeliveryDays?: number | null
  estimatedDeliveryDate?: string | null
  followUpMessage?: string | null
}
