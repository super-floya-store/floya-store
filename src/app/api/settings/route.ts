import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'

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
    const { user } = await requireAdmin()
    const body = await request.json()

    for (const [key, value] of Object.entries(body)) {
      const { error } = await supabaseServer
        .from('settings')
        .upsert(
          { key, value, updated_at: new Date().toISOString(), updated_by: user.id },
          { onConflict: 'key' }
        )

      if (error) {
        return NextResponse.json(
          { success: false, error: { code: 'DATABASE_ERROR', message: error.message } },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true, data: body })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return NextResponse.json(
      { success: false, error: { code: status === 500 ? 'INTERNAL_ERROR' : 'AUTH_ERROR', message } },
      { status }
    )
  }
}
