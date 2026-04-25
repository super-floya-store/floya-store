export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  meta?: {
    timestamp: string
    requestId: string
  }
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  error?: {
    code: string
    message: string
    details?: string
  }
}
