import { configureStore } from '@reduxjs/toolkit'
import productReducer from './slices/productSlice'
import cartReducer from './slices/cartSlice'
import userReducer from './slices/userSlice'
import orderReducer from './slices/orderSlice'
import adminUserReducer from './slices/adminUserSlice'

const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    user: userReducer,
    orders: orderReducer,
    adminUsers: adminUserReducer,
  },
})

store.subscribe(() => {
  try {
    const { cart, user } = store.getState()
    localStorage.setItem('cart', JSON.stringify(cart))
    if (user.userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(user.userInfo))
    } else {
      localStorage.removeItem('userInfo')
    }
  } catch {
    // storage unavailable
  }
})

export default store