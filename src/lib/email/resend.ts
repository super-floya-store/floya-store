import { env } from '@/config/env'

interface ResendPayload {
  from: string
  to: string | string[]
  subject: string
  html: string
}

export async function sendResendEmail(payload: ResendPayload) {
  if (!env.RESEND_API_KEY) {
    return { success: false, skipped: true, error: 'RESEND_API_KEY is not configured' }
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Resend error: ${text}`)
  }

  return response.json()
}
