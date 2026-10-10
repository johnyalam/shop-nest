import { configureStore } from '@reduxjs/toolkit'
import productReducer from './slices/productSlice'
import cartReducer from './slices/cartSlice'

const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
  },
})

// Every time the store changes, save the cart to localStorage
store.subscribe(() => {
  try {
    localStorage.setItem('cart', JSON.stringify(store.getState().cart))
  } catch {
    // storage unavailable: the cart just won't persist
  }
})

export default store