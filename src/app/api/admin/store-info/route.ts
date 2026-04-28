import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { supabaseServer } from '@/lib/supabase/server'

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

    const { data, error } = await supabaseServer
      .from('settings')
      .select('key,value,updated_at')
      .in('key', STORE_INFO_KEYS)

    if (error) {
      return json({ success: false, error: { code: 'DATABASE_ERROR', message: error.message } }, { status: 500 })
    }

    const settings = (data || []).reduce((acc: Record<string, any>, item) => {
      acc[item.key] = item.value
      return acc
    }, {})

    return json({ success: true, data: settings })
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

    const timestamp = new Date().toISOString()

    for (const [key, value] of Object.entries(payload)) {
      const { data: existing, error: readError } = await supabaseServer
        .from('settings')
        .select('id')
        .eq('key', key)
        .maybeSingle()

      if (readError) {
        return json({ success: false, error: { code: 'DATABASE_ERROR', message: readError.message } }, { status: 500 })
      }

      if (existing) {
        const { error } = await supabaseServer
          .from('settings')
          .update({
            value,
            updated_by: user.id,
            updated_at: timestamp,
          })
          .eq('key', key)

        if (error) {
          return json({ success: false, error: { code: 'DATABASE_ERROR', message: error.message } }, { status: 500 })
        }
      } else {
        const { error } = await supabaseServer
          .from('settings')
          .insert({
            key,
            value,
            updated_by: user.id,
            updated_at: timestamp,
          })

        if (error) {
          return json({ success: false, error: { code: 'DATABASE_ERROR', message: error.message } }, { status: 500 })
        }
      }
    }

    const { data, error } = await supabaseServer
      .from('settings')
      .select('key,value')
      .in('key', STORE_INFO_KEYS)

    if (error) {
      return json({ success: false, error: { code: 'DATABASE_ERROR', message: error.message } }, { status: 500 })
    }

    const settings = (data || []).reduce((acc: Record<string, any>, item) => {
      acc[item.key] = item.value
      return acc
    }, {})

    return json({ success: true, data: settings })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return json({ success: false, error: { code: status === 500 ? 'INTERNAL_ERROR' : 'AUTH_ERROR', message } }, { status })
  }
}
