import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'
import { orderSchema, orderStatusSchema } from '@/lib/validations/order'
import { getStoreSettings } from '@/lib/settings/store-settings'
import { buildOrderConfirmationEmail } from '@/lib/email/templates'
import { sendResendEmail } from '@/lib/email/resend'
import { getDeliveryFee } from '@/lib/algeria'

async function upsertCustomerProfile(customerName: string, customerPhone: string) {
  const { data: existing } = await supabaseServer.from('customer_profiles').select('*').eq('phone', customerPhone).maybeSingle()
  const nextFraudFlags = existing ? existing.fraud_flags + (existing.is_blacklisted ? 1 : 0) : 0

  await supabaseServer.from('customer_profiles').upsert({
    phone: customerPhone,
    full_name: customerName,
    last_order_at: new Date().toISOString(),
    fraud_flags: nextFraudFlags,
  }, { onConflict: 'phone' })

  return existing
}

async function decrementProductStock(productId: string, amount: number) {
  const { data: product, error: productError } = await supabaseServer
    .from('products')
    .select('stock_quantity')
    .eq('id', productId)
    .single()

  if (productError || !product) {
    throw new Error('Failed to load product stock')
  }

  const nextStock = product.stock_quantity - amount

  if (nextStock < 0) {
    throw new Error('Insufficient stock')
  }

  const { error: updateError } = await supabaseServer
    .from('products')
    .update({ stock_quantity: nextStock })
    .eq('id', productId)

  if (updateError) {
    throw new Error(updateError.message)
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')
    const search = searchParams.get('search')
    const wilaya = searchParams.get('wilaya')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    let query = supabaseServer.from('orders').select('*', { count: 'exact' })

    if (status) query = query.eq('status', status)
    if (paymentStatus) query = query.eq('payment_status', paymentStatus)
    if (wilaya) query = query.eq('wilaya', wilaya)
    if (dateFrom) query = query.gte('created_at', dateFrom)
    if (dateTo) query = query.lte('created_at', dateTo)
    if (search) {
      query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`)
    }

    query = query.order('created_at', { ascending: false })
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: page * limit < (count || 0),
        hasPrev: page > 1,
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = orderSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid order data', details: result.error.message } },
        { status: 400 }
      )
    }

    const { customerName, customerPhone, customerEmail, wilaya, commune, deliveryAddress, notes, paymentMethod, items } = result.data
    const customerProfile = await upsertCustomerProfile(customerName, customerPhone)

    if (customerProfile?.is_blacklisted) {
      return NextResponse.json(
        { success: false, error: { code: 'BLOCKED_CUSTOMER', message: 'هذا الرقم محظور من الطلب حالياً' } },
        { status: 403 }
      )
    }

    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const { data: product } = await supabaseServer
        .from('products')
        .select('*')
        .eq('id', item.productId)
        .eq('is_published', true)
        .single()

      if (!product || product.stock_quantity < item.quantity) {
        return NextResponse.json(
          { success: false, error: { code: 'INSUFFICIENT_STOCK', message: `Product ${product?.name_ar || item.productId} is out of stock` } },
          { status: 400 }
        )
      }

      const unitPrice = product.promo_price || product.price
      const totalPrice = unitPrice * item.quantity
      subtotal += totalPrice

      orderItems.push({
        product_id: item.productId,
        product_name_ar: product.name_ar,
        product_name_en: product.name_en,
        product_image: product.images[product.primary_image_index] || null,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
      })
    }

    const settings = await getStoreSettings()
    const deliveryFee = getDeliveryFee(settings.delivery_fees, wilaya, 500)
    const total = subtotal + deliveryFee

    const { data: order, error: orderError } = await supabaseServer
      .from('orders')
      .insert({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        wilaya,
        commune,
        delivery_address: deliveryAddress,
        notes,
        payment_method: paymentMethod,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_status: 'pending',
      })
      .select()
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: orderError?.message || 'Failed to create order' } },
        { status: 500 }
      )
    }

    const orderItemsWithOrderId = orderItems.map((item) => ({ ...item, order_id: order.id }))

    const { error: itemsError } = await supabaseServer.from('order_items').insert(orderItemsWithOrderId)

    if (itemsError) {
      await supabaseServer.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: itemsError.message } },
        { status: 500 }
      )
    }

    for (const item of items) {
      await decrementProductStock(item.productId, item.quantity)
    }

    if (customerEmail) {
      if (settings.order_email_enabled !== false) {
        const orderWithItems = { ...order, items: orderItemsWithOrderId }
        const email = buildOrderConfirmationEmail(orderWithItems as any, settings)
        const fromName = settings.email_sender_name || settings.store_name?.ar || 'Floya Store'
        const fromAddress = settings.email_sender_address || 'onboarding@resend.dev'

        await sendResendEmail({
          from: `${fromName} <${fromAddress}>`,
          to: customerEmail,
          subject: email.subject,
          html: email.html,
        }).catch((emailError) => {
          console.error('Order confirmation email error:', emailError)
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        orderNumber: order.order_number,
        total: order.total,
        message: 'Order created successfully',
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
