import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { supabaseServer } from '@/lib/supabase/server'
import { customerProfileUpdateSchema } from '@/lib/validations/customer-profile'

export async function PUT(request: NextRequest, { params }: { params: { phone: string } }) {
  try {
    await requireAdmin()
    const body = await request.json()
    const result = customerProfileUpdateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid customer profile update' } }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from('customer_profiles')
      .upsert({ phone: params.phone, ...result.data }, { onConflict: 'phone' })
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal server error' } }, { status: 500 })
  }
}
