import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import sharp from 'sharp'
import { supabaseServer } from '@/lib/supabase/server'
import { env } from '@/config/env'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const formData = await request.formData()
    const file = formData.get('file') as File
    const purpose = String(formData.get('purpose') || 'product')

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_FILE', message: 'No file provided' } },
        { status: 400 }
      )
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TYPE', message: 'Invalid file type. Only JPEG, PNG, WebP allowed' } },
        { status: 400 }
      )
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: { code: 'FILE_TOO_LARGE', message: 'File size exceeds 5MB limit' } },
        { status: 400 }
      )
    }

    const sizes: Record<string, { width: number; height: number }> = {
      product: { width: 1200, height: 1500 },
      category: { width: 1400, height: 1000 },
      banner: { width: 1800, height: 1100 },
    }

    const target = sizes[purpose] || sizes.product
    const buffer = Buffer.from(await file.arrayBuffer())
    const optimized = await sharp(buffer)
      .rotate()
      .resize(target.width, target.height, { fit: 'cover' })
      .webp({ quality: 84 })
      .toBuffer()

    const path = `${purpose}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`

    const { error: uploadError } = await supabaseServer.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .upload(path, optimized, { contentType: 'image/webp', upsert: true })

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: { code: 'UPLOAD_ERROR', message: uploadError.message } },
        { status: 500 }
      )
    }

    const { data } = supabaseServer.storage.from(env.SUPABASE_STORAGE_BUCKET).getPublicUrl(path)

    return NextResponse.json({
      success: true,
      data: {
        url: data.publicUrl,
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
