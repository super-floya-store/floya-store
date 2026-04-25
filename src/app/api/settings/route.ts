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
    await requireAdmin()
    const body = await request.json()

    for (const [key, value] of Object.entries(body)) {
      await supabaseServer.from('settings').upsert({ key, value })
    }

    return NextResponse.json({ success: true, data: body })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
