import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { requireAdmin, requireAuth } from '@/lib/auth/session'
import { orderSchema, orderStatusSchema } from '@/lib/validations/order'
import { getStoreSettings } from '@/lib/settings/store-settings'
import { getDeliveryFee } from '@/lib/algeria'
import { getVipDeliveryFee, getVipDiscountedPrice } from '@/lib/pricing/vip'
import { recalculateProductAggregates } from '@/lib/products/inventory'

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

async function decrementVariantStock(variantId: string, amount: number) {
  const { data: variant, error } = await supabaseServer
    .from('product_variants')
    .select('stock_quantity, product_id')
    .eq('id', variantId)
    .single()

  if (error || !variant) {
    throw new Error('Failed to load product variant stock')
  }

  const nextStock = variant.stock_quantity - amount
  if (nextStock < 0) {
    throw new Error('Insufficient variant stock')
  }

  const { error: updateError } = await supabaseServer
    .from('product_variants')
    .update({ stock_quantity: nextStock })
    .eq('id', variantId)

  if (updateError) throw new Error(updateError.message)
  await recalculateProductAggregates(variant.product_id)
}

async function reserveDigitalInventory(productId: string, variantId: string | null, quantity: number) {
  let query = supabaseServer
    .from('digital_inventory_units')
    .select('*')
    .eq('product_id', productId)
    .eq('status', 'available')
    .order('created_at', { ascending: true })
    .limit(quantity)

  if (variantId) {
    query = query.eq('variant_id', variantId)
  }

  const { data: units, error } = await query
  if (error || !units || units.length < quantity) {
    throw new Error('Insufficient digital inventory')
  }

  const ids = units.map((unit) => unit.id)
  const { error: updateError } = await supabaseServer
    .from('digital_inventory_units')
    .update({
      status: 'reserved',
      reserved_at: new Date().toISOString(),
    })
    .in('id', ids)

  if (updateError) throw new Error(updateError.message)
  await recalculateProductAggregates(productId)
  return units
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
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
    const productTypes = new Set<string>()
    const reservedDigitalUnitsByItemKey = new Map<string, any[]>()

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

      productTypes.add(product.product_type || 'physical_simple')

      let variant: any = null
      if (product.product_type === 'physical_variant') {
        if (!item.variantId) {
          return NextResponse.json(
            { success: false, error: { code: 'VARIANT_REQUIRED', message: 'A size/color selection is required for this product' } },
            { status: 400 }
          )
        }

        const { data: variantData } = await supabaseServer
          .from('product_variants')
          .select('*')
          .eq('id', item.variantId)
          .eq('product_id', product.id)
          .eq('is_active', true)
          .single()

        if (!variantData || variantData.stock_quantity < item.quantity) {
          return NextResponse.json(
            { success: false, error: { code: 'INSUFFICIENT_STOCK', message: `Variant for ${product.name_en} is out of stock` } },
            { status: 400 }
          )
        }
        variant = variantData
      }

      if ((product.product_type === 'digital_account' || product.product_type === 'digital_text') && paymentMethod === 'cod') {
        return NextResponse.json(
          { success: false, error: { code: 'PAYMENT_METHOD_NOT_ALLOWED', message: 'Digital account products require prepaid payment' } },
          { status: 400 }
        )
      }

      const baseUnitPrice = variant?.price_override ?? product.promo_price ?? product.price
      standardSubtotal += baseUnitPrice * item.quantity
      const promoReference = variant?.promo_price_override ?? product.promo_price
      const unitPrice = getVipDiscountedPrice(promoReference || baseUnitPrice, session.user.is_vip)
      const totalPrice = unitPrice * item.quantity
      subtotal += totalPrice

      if (product.product_type === 'digital_account' || product.product_type === 'digital_text') {
        const reservedUnits = await reserveDigitalInventory(product.id, item.variantId || null, item.quantity)
        reservedDigitalUnitsByItemKey.set(`${product.id}:${item.variantId || 'none'}`, reservedUnits)
      }

      orderItems.push({
        product_id: item.productId,
        variant_id: variant?.id || null,
        variant_size: variant?.size || null,
        variant_color: variant?.color || null,
        variant_label: variant ? [variant.size, variant.color].filter(Boolean).join(' / ') || variant.name_en || variant.name_ar || null : null,
        product_type: product.product_type || 'physical_simple',
        fulfillment_status: product.product_type === 'digital_account' || product.product_type === 'digital_text' ? 'reserved' : 'pending',
        product_name_ar: product.name_ar,
        product_name_en: product.name_en,
        product_image: product.images[product.primary_image_index] || null,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
      })
    }

    const settings = await getStoreSettings()
    if (productTypes.size > 1) {
      return NextResponse.json(
        { success: false, error: { code: 'MIXED_CART_NOT_SUPPORTED', message: 'Mixed physical and digital carts are not supported yet' } },
        { status: 400 }
      )
    }

    const cartType = Array.from(productTypes)[0] || 'physical_simple'
    const standardDeliveryFee = cartType === 'digital_account' || cartType === 'digital_text' ? 0 : getDeliveryFee(settings.delivery_fees, wilaya, 500)
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
        status: cartType === 'digital_account' || cartType === 'digital_text' ? 'submitted' : 'pending',
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
      for (const units of Array.from(reservedDigitalUnitsByItemKey.values())) {
        await supabaseServer
          .from('digital_inventory_units')
          .update({ status: 'available', reserved_at: null })
          .in('id', units.map((unit) => unit.id))
      }
      await supabaseServer.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: itemsError.message } },
        { status: 500 }
      )
    }

    const { data: insertedOrderItems } = await supabaseServer
      .from('order_items')
      .select('id, product_id, variant_id')
      .eq('order_id', order.id)

    for (const item of items) {
      const matchingOrderItem = insertedOrderItems?.find((orderItem) => orderItem.product_id === item.productId && (orderItem.variant_id || null) === (item.variantId || null))
      const matchingProductType = orderItems.find((orderItem) => orderItem.product_id === item.productId && (orderItem.variant_id || null) === (item.variantId || null))?.product_type
      if (matchingProductType === 'physical_variant' && item.variantId) {
        await decrementVariantStock(item.variantId, item.quantity)
      } else if (matchingProductType === 'physical_simple') {
        await decrementProductStock(item.productId, item.quantity)
      } else if ((matchingProductType === 'digital_account' || matchingProductType === 'digital_text') && matchingOrderItem) {
        const reservedUnits = reservedDigitalUnitsByItemKey.get(`${item.productId}:${item.variantId || 'none'}`) || []
        await supabaseServer
          .from('digital_inventory_units')
          .update({ order_item_id: matchingOrderItem.id })
          .in('id', reservedUnits.map((unit) => unit.id))
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
