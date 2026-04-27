import { supabaseServer } from '@/lib/supabase/server'
import type { ProductInput, ProductUpdateInput } from '@/lib/validations/product'

type VariantInput = NonNullable<ProductInput['variants']>[number]
type DigitalUnitInput = NonNullable<ProductInput['digital_inventory_units']>[number]

function getBasePrice(payload: ProductInput | ProductUpdateInput, variant?: VariantInput | null) {
  const price = variant?.price_override ?? payload.price ?? 0
  const promo = variant?.promo_price_override ?? payload.promo_price ?? null
  return { price, promo }
}

export async function syncProductChildren(productId: string, payload: ProductInput | ProductUpdateInput) {
  const { data: currentProduct } = await supabaseServer
    .from('products')
    .select('product_type')
    .eq('id', productId)
    .single()

  const productType = payload.product_type || currentProduct?.product_type || 'physical_simple'
  const shouldSyncVariants = Array.isArray(payload.variants) || payload.product_type === 'physical_variant' || currentProduct?.product_type === 'physical_variant'
  const shouldSyncDigitalUnits = Array.isArray(payload.digital_inventory_units) || payload.product_type === 'digital_account' || currentProduct?.product_type === 'digital_account'

  if (shouldSyncVariants && productType === 'physical_variant' && Array.isArray(payload.variants)) {
    const variants = (payload.variants || []).map((variant, index) => ({
      id: variant.id,
      product_id: productId,
      sku: variant.sku || null,
      size: variant.size || null,
      color: variant.color || null,
      name_ar: variant.name_ar || null,
      name_en: variant.name_en || null,
      price_override: variant.price_override ?? null,
      promo_price_override: variant.promo_price_override ?? null,
      stock_quantity: variant.stock_quantity ?? 0,
      low_stock_threshold: variant.low_stock_threshold ?? 3,
      is_active: variant.is_active ?? true,
      sort_order: variant.sort_order ?? index,
    }))

    await supabaseServer.from('product_variants').delete().eq('product_id', productId)
    if (variants.length > 0) {
      const { error } = await supabaseServer.from('product_variants').insert(variants)
      if (error) throw error
    }
  } else if (shouldSyncVariants && productType !== 'physical_variant') {
    await supabaseServer.from('product_variants').delete().eq('product_id', productId)
  }

  if (shouldSyncDigitalUnits && productType === 'digital_account' && Array.isArray(payload.digital_inventory_units)) {
    const units = (payload.digital_inventory_units || []).map((unit) => ({
      id: unit.id,
      product_id: productId,
      variant_id: unit.variant_id || null,
      title: unit.title || null,
      payload: unit.payload,
      status: unit.status || 'available',
    }))

    await supabaseServer.from('digital_inventory_units').delete().eq('product_id', productId).is('order_item_id', null)
    if (units.length > 0) {
      const { error } = await supabaseServer.from('digital_inventory_units').insert(units)
      if (error) throw error
    }
  } else if (shouldSyncDigitalUnits && productType !== 'digital_account') {
    await supabaseServer.from('digital_inventory_units').delete().eq('product_id', productId).is('order_item_id', null)
  }

  await recalculateProductAggregates(productId, payload)
}

export async function recalculateProductAggregates(productId: string, payload?: ProductInput | ProductUpdateInput) {
  const { data: product } = await supabaseServer
    .from('products')
    .select('product_type, price, promo_price, stock_quantity, low_stock_threshold')
    .eq('id', productId)
    .single()

  if (!product) return

  if (product.product_type === 'physical_variant') {
    const { data: variants } = await supabaseServer
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    const rows = variants || []
    const stock = rows.reduce((sum, variant) => sum + variant.stock_quantity, 0)
    let minPrice = payload?.price ?? product.price
    let minPromo = payload?.promo_price ?? product.promo_price
    let lowStockThreshold = rows.length > 0 ? Math.min(...rows.map((variant) => variant.low_stock_threshold || 3)) : (payload?.low_stock_threshold ?? product.low_stock_threshold ?? 3)

    if (rows.length > 0) {
      const first = rows[0]
      const firstPrice = first.price_override ?? payload?.price ?? product.price
      minPrice = firstPrice
      minPromo = first.promo_price_override ?? payload?.promo_price ?? product.promo_price

      for (const variant of rows) {
        const { price, promo } = getBasePrice(payload || product, variant)
        if (price < minPrice) minPrice = price
        if (promo !== null && (minPromo === null || promo < minPromo)) minPromo = promo
      }
    }

    await supabaseServer
      .from('products')
      .update({
        stock_quantity: stock,
        price: minPrice,
        promo_price: minPromo,
        low_stock_threshold: lowStockThreshold,
      })
      .eq('id', productId)
    return
  }

  if (product.product_type === 'digital_account') {
    const { count } = await supabaseServer
      .from('digital_inventory_units')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)
      .eq('status', 'available')

    await supabaseServer
      .from('products')
      .update({
        stock_quantity: count || 0,
      })
      .eq('id', productId)
  }
}

export async function getProductVariants(productId: string) {
  const { data } = await supabaseServer
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true })

  return data || []
}

export async function getAvailableDigitalUnitCount(productId: string) {
  const { count } = await supabaseServer
    .from('digital_inventory_units')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', productId)
    .eq('status', 'available')

  return count || 0
}
