import { createSlice } from '@reduxjs/toolkit'

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem('cart')) || {}
  } catch {
    return {}
  }
}

const saved = loadCart()

const initialState = {
  cartItems: saved.cartItems || [],
  shippingAddress: saved.shippingAddress || {},
  paymentMethod: saved.paymentMethod || '',
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const item = action.payload
      const existing = state.cartItems.find((x) => x.product === item.product)
      if (existing) {
        existing.qty = Math.min(existing.qty + item.qty, item.countInStock)
      } else {
        state.cartItems.push(item)
      }
    },
    updateCartQty(state, action) {
      const { id, qty } = action.payload
      const item = state.cartItems.find((x) => x.product === id)
      if (item) item.qty = qty
    },
    removeFromCart(state, action) {
      state.cartItems = state.cartItems.filter((x) => x.product !== action.payload)
    },
    saveShippingAddress(state, action) {
      state.shippingAddress = action.payload
    },
    savePaymentMethod(state, action) {
      state.paymentMethod = action.payload
    },
    clearCart(state) {
      state.cartItems = []
    },
  },
})

export const {
  addToCart, updateCartQty, removeFromCart,
  saveShippingAddress, savePaymentMethod, clearCart,
} = cartSlice.actions
export default cartSlice.reducer