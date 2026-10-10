import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { getError } from '../utils/getError'
import { authConfig } from '../utils/authConfig'
import { clearCart } from './cartSlice'

export const createOrder = createAsyncThunk(
  'orders/create',
  async (order, { getState, dispatch, rejectWithValue }) => {
    try {
      const { data } = await axios.post('/api/orders/add/', order, authConfig(getState))
      dispatch(clearCart())
      return data
    } catch (err) {
      return rejectWithValue(getError(err))
    }
  }
)

const initialState = {
  create: { order: null, loading: false, error: null },
}

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetCreateOrder(state) {
      state.create = initialState.create
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.create.loading = true
        state.create.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.create.loading = false
        state.create.order = action.payload
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.create.loading = false
        state.create.error = action.payload
      })
  },
})

export const { resetCreateOrder } = orderSlice.actions
export default orderSlice.reducer