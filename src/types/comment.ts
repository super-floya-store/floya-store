export type CommentEntityType = 'product' | 'category'
export type CommentStatus = 'pending' | 'approved' | 'rejected'

export interface Comment {
  id: string
  entity_type: CommentEntityType
  entity_id: string
  customer_name: string
  customer_email: string | null
  rating: number
  comment: string
  status: CommentStatus
  admin_notes: string | null
  approved_at: string | null
  approved_by: string | null
  created_at: string
  updated_at: string
}
