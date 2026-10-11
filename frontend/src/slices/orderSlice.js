import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { getError } from '../utils/getError'
import { authConfig } from '../utils/authConfig'
import { clearCart } from './cartSlice'
import { logout } from './userSlice'

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

export const getOrderDetails = createAsyncThunk(
  'orders/details',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/orders/${id}/`, authConfig(getState))
      return data
    } catch (err) {
      return rejectWithValue(getError(err))
    }
  }
)

export const payOrder = createAsyncThunk(
  'orders/pay',
  async ({ orderId, paypalOrderId }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `/api/orders/${orderId}/paypal/capture/`, { paypalOrderId }, authConfig(getState))
      return data
    } catch (err) {
      return rejectWithValue(getError(err))
    }
  }
)

export const listMyOrders = createAsyncThunk(
  'orders/mine',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/orders/myorders/', authConfig(getState))
      return data
    } catch (err) {
      return rejectWithValue(getError(err))
    }
  }
)

export const listAllOrders = createAsyncThunk(
  'orders/all',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/orders/', authConfig(getState))
      return data
    } catch (err) {
      return rejectWithValue(getError(err))
    }
  }
)

export const deliverOrder = createAsyncThunk(
  'orders/deliver',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.put(`/api/orders/${id}/deliver/`, {}, authConfig(getState))
      return data
    } catch (err) {
      return rejectWithValue(getError(err))
    }
  }
)

const initialState = {
  create: { order: null, loading: false, error: null },
  details: { order: null, loading: false, error: null },
  pay: { loading: false, error: null },
  mine: { orders: [], loading: false, error: null },
  all: { orders: [], loading: false, error: null },
  deliver: { loading: false, error: null },
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
      // create
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
      // details
      .addCase(getOrderDetails.pending, (state) => {
        state.details = { order: null, loading: true, error: null }
        state.pay = initialState.pay
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.details.loading = false
        state.details.order = action.payload
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.details.loading = false
        state.details.error = action.payload
      })
      // pay
      .addCase(payOrder.pending, (state) => {
        state.pay = { loading: true, error: null }
      })
      .addCase(payOrder.fulfilled, (state, action) => {
        state.pay.loading = false
        state.details.order = action.payload // now isPaid: true
      })
      .addCase(payOrder.rejected, (state, action) => {
        state.pay.loading = false
        state.pay.error = action.payload
      })
      // my orders
      .addCase(listMyOrders.pending, (state) => {
        state.mine.loading = true
        state.mine.error = null
      })
      .addCase(listMyOrders.fulfilled, (state, action) => {
        state.mine.loading = false
        state.mine.orders = action.payload
      })
      .addCase(listMyOrders.rejected, (state, action) => {
        state.mine.loading = false
        state.mine.error = action.payload
      })
            // all orders (admin)
      .addCase(listAllOrders.pending, (state) => {
        state.all.loading = true
        state.all.error = null
      })
      .addCase(listAllOrders.fulfilled, (state, action) => {
        state.all.loading = false
        state.all.orders = action.payload
      })
      .addCase(listAllOrders.rejected, (state, action) => {
        state.all.loading = false
        state.all.error = action.payload
      })
      // deliver (admin)
      .addCase(deliverOrder.pending, (state) => {
        state.deliver = { loading: true, error: null }
      })
      .addCase(deliverOrder.fulfilled, (state, action) => {
        state.deliver.loading = false
        state.details.order = action.payload
      })
      .addCase(deliverOrder.rejected, (state, action) => {
        state.deliver.loading = false
        state.deliver.error = action.payload
      })
      // forget orders on logout
      .addCase(logout, () => initialState)
  },
})

export const { resetCreateOrder } = orderSlice.actions
export default orderSlice.reducer