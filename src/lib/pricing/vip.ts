export const VIP_PRODUCT_DISCOUNT_RATE = 0.1

export function getVipDiscountedPrice(price: number, isVip: boolean) {
  if (!isVip) return price
  return Math.max(0, Math.round(price * (1 - VIP_PRODUCT_DISCOUNT_RATE)))
}

export function getVipDeliveryFee(deliveryFee: number, isVip: boolean) {
  return isVip ? 0 : deliveryFee
}
