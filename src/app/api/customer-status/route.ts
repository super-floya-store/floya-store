import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get('phone')?.trim()

    if (!phone) {
      return NextResponse.json({ success: true, data: { isVip: false, isBlacklisted: false } })
    }

    const { data: profile } = await supabaseServer
      .from('customer_profiles')
      .select('is_vip, is_blacklisted')
      .eq('phone', phone)
      .maybeSingle()

    return NextResponse.json({
      success: true,
      data: {
        isVip: !!profile?.is_vip,
        isBlacklisted: !!profile?.is_blacklisted,
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
