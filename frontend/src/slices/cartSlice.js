import { createSlice } from '@reduxjs/toolkit'

// Load the saved cart (if any) when the app starts
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
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const item = action.payload
      const existing = state.cartItems.find((x) => x.product === item.product)
      if (existing) {
        // Already in the cart: add to the quantity, but never above stock
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
    clearCart(state) {
      state.cartItems = []
    },
  },
})

export const { addToCart, updateCartQty, removeFromCart, clearCart } = cartSlice.actions
export default cartSlice.reducer