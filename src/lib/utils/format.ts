export function formatPrice(price: number, currency: string = 'DZD'): string {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

export function formatDate(date: string | Date, locale: string = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-DZ' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export function formatDateTime(date: string | Date, locale: string = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-DZ' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatNumber(num: number, locale: string = 'ar'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'en-US').format(num)
}

export function calculateDiscount(price: number, promoPrice: number): number {
  return Math.round(((price - promoPrice) / price) * 100)
}
