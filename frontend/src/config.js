// Must match the SHOP_* settings in Django (Django's numbers are the real ones)
export const VAT_RATE = 0.255
export const SHIPPING_PRICE = 5.9
export const FREE_SHIPPING_FROM = 100

export function calcPrices(cartItems) {
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  const shippingPrice = itemsPrice >= FREE_SHIPPING_FROM || itemsPrice === 0 ? 0 : SHIPPING_PRICE
  const totalPrice = itemsPrice + shippingPrice
  const vatIncluded = (totalPrice * VAT_RATE) / (1 + VAT_RATE)
  const fmt = (n) => n.toFixed(2)
  return {
    itemsPrice: fmt(itemsPrice),
    shippingPrice: fmt(shippingPrice),
    totalPrice: fmt(totalPrice),
    vatIncluded: fmt(vatIncluded),
  }
}