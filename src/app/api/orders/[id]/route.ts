import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'
import { orderStatusSchema } from '@/lib/validations/order'
import { recalculateProductAggregates } from '@/lib/products/inventory'

async function incrementProductStock(productId: string, amount: number) {
  const { data: product, error: productError } = await supabaseServer
    .from('products')
    .select('stock_quantity')
    .eq('id', productId)
    .single()

  if (productError || !product) {
    throw new Error('Failed to load product stock')
  }

  const { error: updateError } = await supabaseServer
    .from('products')
    .update({ stock_quantity: product.stock_quantity + amount })
    .eq('id', productId)

  if (updateError) {
    throw new Error(updateError.message)
  }
}

async function incrementVariantStock(variantId: string, amount: number) {
  const { data: variant, error } = await supabaseServer
    .from('product_variants')
    .select('stock_quantity, product_id')
    .eq('id', variantId)
    .single()

  if (error || !variant) {
    throw new Error('Failed to load product variant stock')
  }

  const { error: updateError } = await supabaseServer
    .from('product_variants')
    .update({ stock_quantity: variant.stock_quantity + amount })
    .eq('id', variantId)

  if (updateError) throw new Error(updateError.message)
  await recalculateProductAggregates(variant.product_id)
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()

    const { data: order, error } = await supabaseServer
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      )
    }

    const { data: items } = await supabaseServer
      .from('order_items')
      .select('*')
      .eq('order_id', params.id)

    return NextResponse.json({
      success: true,
      data: { ...order, items: items || [] },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const body = await request.json()
    const result = orderStatusSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid status data' } },
        { status: 400 }
      )
    }

    const { status, trackingNumber, cancelledReason, paymentStatus, paymentReviewNotes, estimatedDeliveryDays, estimatedDeliveryDate, followUpMessage } = result.data

    const { data: existingOrder } = await supabaseServer
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      )
    }

    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: [],
      refunded: [],
    }

    if (status !== existingOrder.status && !validTransitions[existingOrder.status]?.includes(status)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TRANSITION', message: `Cannot transition from ${existingOrder.status} to ${status}` } },
        { status: 400 }
      )
    }

    const updates: any = { status }

    if (paymentStatus) {
      updates.payment_status = paymentStatus
      updates.payment_reviewed_at = new Date().toISOString()
      updates.payment_review_notes = paymentReviewNotes || null
      if (paymentStatus === 'paid' && existingOrder.status === 'pending') {
        updates.status = 'confirmed'
        updates.confirmed_at = new Date().toISOString()
        updates.receipt_issued_at = existingOrder.receipt_issued_at || new Date().toISOString()
        updates.estimated_delivery_days = existingOrder.estimated_delivery_days ?? estimatedDeliveryDays ?? 3
        updates.estimated_delivery_date = existingOrder.estimated_delivery_date ?? estimatedDeliveryDate ?? null
      }
      if (paymentStatus === 'rejected' && existingOrder.status === 'confirmed') {
        updates.status = 'pending'
        updates.refund_status = 'rejected'
      }
      if (paymentStatus === 'refunded') {
        updates.refund_status = 'refunded'
      }

      if (paymentStatus === 'paid') {
        const { data: orderItems } = await supabaseServer.from('order_items').select('*').eq('order_id', params.id)
        const digitalItems = (orderItems || []).filter((item) => item.product_type === 'digital_account')
        if (digitalItems.length > 0) {
          const orderItemIds = digitalItems.map((item) => item.id)
          await supabaseServer
            .from('digital_inventory_units')
            .update({ status: 'delivered', delivered_at: new Date().toISOString() })
            .in('order_item_id', orderItemIds)

          await supabaseServer
            .from('order_items')
            .update({ fulfillment_status: 'delivered' })
            .in('id', orderItemIds)

          const hasOnlyDigital = (orderItems || []).every((item) => item.product_type === 'digital_account')
          if (hasOnlyDigital) {
            updates.status = 'delivered'
            updates.delivered_at = new Date().toISOString()
          }
        }
      }
    }

    if (typeof estimatedDeliveryDays !== 'undefined') {
      updates.estimated_delivery_days = estimatedDeliveryDays
    }

    if (typeof estimatedDeliveryDate !== 'undefined') {
      updates.estimated_delivery_date = estimatedDeliveryDate || null
    }

    if (typeof followUpMessage !== 'undefined') {
      updates.follow_up_message = followUpMessage || null
    }

    if (status === 'shipped' && trackingNumber) {
      updates.tracking_number = trackingNumber
      updates.shipped_at = new Date().toISOString()
    }

    if (status === 'delivered') {
      updates.delivered_at = new Date().toISOString()
    }

    if (status === 'confirmed') {
      updates.confirmed_at = new Date().toISOString()
      updates.receipt_issued_at = existingOrder.receipt_issued_at || new Date().toISOString()
    }

    if (status === 'refunded') {
      updates.refund_status = 'refunded'
    }

    if (status === 'cancelled') {
      if (!cancelledReason) {
        return NextResponse.json(
          { success: false, error: { code: 'REQUIRED_FIELD', message: 'Cancellation reason is required' } },
          { status: 400 }
        )
      }
      updates.cancelled_at = new Date().toISOString()
      updates.cancelled_reason = cancelledReason

      const { data: orderItems } = await supabaseServer.from('order_items').select('*').eq('order_id', params.id)
      if (orderItems) {
        for (const item of orderItems) {
          if (item.product_type === 'physical_variant' && item.variant_id) {
            await incrementVariantStock(item.variant_id, item.quantity)
          } else if (item.product_type === 'physical_simple') {
            await incrementProductStock(item.product_id, item.quantity)
          } else if (item.product_type === 'digital_account') {
            const { data: units } = await supabaseServer.from('digital_inventory_units').select('id, product_id').eq('order_item_id', item.id)
            if (units && units.length > 0) {
              await supabaseServer
                .from('digital_inventory_units')
                .update({ status: 'available', order_item_id: null, reserved_at: null, delivered_at: null })
                .in('id', units.map((unit) => unit.id))
              await recalculateProductAggregates(item.product_id)
            }
          }
        }
      }
    }

    const { data, error } = await supabaseServer.from('orders').update(updates).eq('id', params.id).select().single()

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
