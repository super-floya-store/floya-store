import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getStoreSettings, upsertStoreSettingsEntries } from '@/lib/settings/store-settings'

export const dynamic = 'force-dynamic'

function json(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init)
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  return response
}

const STORE_INFO_KEYS = [
  'store_name',
  'store_phone',
  'store_whatsapp',
  'store_email',
  'admin_notification_email',
]

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const settings = await getStoreSettings()
    return json({
      success: true,
      data: Object.fromEntries(STORE_INFO_KEYS.map((key) => [key, settings[key as keyof typeof settings]])),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return json({ success: false, error: { code: status === 500 ? 'INTERNAL_ERROR' : 'AUTH_ERROR', message } }, { status })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user } = await requireAdmin(request)
    const body = await request.json()

    const payload = {
      store_name: {
        ar: body.store_name?.ar || 'فلويا ستور',
        en: body.store_name?.en || 'Floya Store',
      },
      store_phone: body.store_phone || '',
      store_whatsapp: body.store_whatsapp || '',
      store_email: body.store_email || '',
      admin_notification_email: body.admin_notification_email || body.store_email || '',
    }

    const { data, error } = await upsertStoreSettingsEntries(
      Object.entries(payload).map(([key, value]) => ({ key, value })),
      user.id
    )

    if (error || !data) {
      return json({ success: false, error: { code: 'DATABASE_ERROR', message: error || 'Failed to save store info' } }, { status: 500 })
    }

    return json({
      success: true,
      data: Object.fromEntries(STORE_INFO_KEYS.map((key) => [key, data[key as keyof typeof data]])),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return json({ success: false, error: { code: status === 500 ? 'INTERNAL_ERROR' : 'AUTH_ERROR', message } }, { status })
  }
}
