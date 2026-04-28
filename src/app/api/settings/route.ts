import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getStoreSettings, upsertStoreSettingsEntries } from '@/lib/settings/store-settings'

export const dynamic = 'force-dynamic'

function jsonWithNoStore(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init)
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  return response
}

export async function GET() {
  try {
    const normalizedSettings = await getStoreSettings()
    return jsonWithNoStore({
      success: true,
      data: normalizedSettings,
    })
  } catch {
    return jsonWithNoStore(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user } = await requireAdmin(request)
    const body = await request.json()
    const entries = Object.entries(body).map(([key, value]) => ({ key, value }))

    if (entries.length === 0) {
      return jsonWithNoStore({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No settings provided' } }, { status: 400 })
    }

    const { data, error } = await upsertStoreSettingsEntries(entries, user.id)

    if (error || !data) {
      return jsonWithNoStore(
        { success: false, error: { code: 'DATABASE_ERROR', message: error || 'Failed to save settings' } },
        { status: 500 }
      )
    }

    return jsonWithNoStore({ success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return jsonWithNoStore(
      { success: false, error: { code: status === 500 ? 'INTERNAL_ERROR' : 'AUTH_ERROR', message } },
      { status }
    )
  }
}
