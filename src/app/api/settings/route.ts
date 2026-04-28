import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data, error } = await supabaseServer.from('settings').select('*')

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    const settings = data.reduce((acc: any, item) => {
      acc[item.key] = item.value
      return acc
    }, {})

    return NextResponse.json({ success: true, data: settings })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const entries = Object.entries(body).map(([key, value]) => ({ key, value }))

    if (entries.length === 0) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No settings provided' } }, { status: 400 })
    }

    const { error } = await supabaseServer
      .from('settings')
      .upsert(entries, { onConflict: 'key' })

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    const { data, error: readError } = await supabaseServer.from('settings').select('*')

    if (readError) {
      return NextResponse.json({ success: true, data: body, warning: readError.message })
    }

    const settings = data.reduce((acc: any, item) => {
      acc[item.key] = item.value
      return acc
    }, {})

    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return NextResponse.json(
      { success: false, error: { code: status === 500 ? 'INTERNAL_ERROR' : 'AUTH_ERROR', message } },
      { status }
    )
  }
}
