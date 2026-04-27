import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { requireAdmin, requireAuth } from '@/lib/auth/session'
import { orderSchema, orderStatusSchema } from '@/lib/validations/order'
import { getStoreSettings } from '@/lib/settings/store-settings'
import { getDeliveryFee } from '@/lib/algeria'
import { getVipDeliveryFee, getVipDiscountedPrice } from '@/lib/pricing/vip'

async function upsertCustomerProfile(userId: string, customerName: string, customerPhone: string, customerEmail: string | null) {
  const { data: existing } = await supabaseServer
    .from('customer_profiles')
    .select('*')
    .or(`user_id.eq.${userId},phone.eq.${customerPhone}`)
    .maybeSingle()
  const nextFraudFlags = existing ? existing.fraud_flags + (existing.is_blacklisted ? 1 : 0) : 0

  const payload = {
    user_id: userId,
    phone: customerPhone,
    full_name: customerName,
    email: customerEmail,
    last_order_at: new Date().toISOString(),
    fraud_flags: nextFraudFlags,
  }

  if (existing) {
    await supabaseServer.from('customer_profiles').update(payload).eq('id', existing.id)
  } else {
    await supabaseServer.from('customer_profiles').insert(payload)
  }

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
    const session = await requireAuth()
    const body = await request.json()
    const result = orderSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid order data', details: result.error.message } },
        { status: 400 }
      )
    }

    const { customerName, customerPhone, customerEmail, wilaya, commune, deliveryAddress, notes, paymentMethod, items } = result.data
    const resolvedEmail = session.user.email || customerEmail || null
    const customerProfile = await upsertCustomerProfile(session.user.id, customerName, customerPhone, resolvedEmail)

    if (customerProfile?.is_blacklisted) {
      return NextResponse.json(
        { success: false, error: { code: 'BLOCKED_CUSTOMER', message: 'هذا الرقم محظور من الطلب حالياً' } },
        { status: 403 }
      )
    }

    let subtotal = 0
    let standardSubtotal = 0
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

      const baseUnitPrice = product.promo_price || product.price
      standardSubtotal += baseUnitPrice * item.quantity
      const unitPrice = getVipDiscountedPrice(baseUnitPrice, session.user.is_vip)
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
    const standardDeliveryFee = getDeliveryFee(settings.delivery_fees, wilaya, 500)
    const deliveryFee = getVipDeliveryFee(standardDeliveryFee, session.user.is_vip)
    const vipDiscountAmount = session.user.is_vip ? standardSubtotal + standardDeliveryFee - (subtotal + deliveryFee) : 0
    const total = subtotal + deliveryFee

    const { data: order, error: orderError } = await supabaseServer
      .from('orders')
      .insert({
        user_id: session.user.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: resolvedEmail,
        wilaya,
        commune,
        delivery_address: deliveryAddress,
        notes,
        payment_method: paymentMethod,
        subtotal,
        delivery_fee: deliveryFee,
        vip_discount_amount: Math.max(0, vipDiscountAmount),
        priority_fulfillment: session.user.is_vip,
        total,
        payment_status: 'pending',
        refund_status: 'none',
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
