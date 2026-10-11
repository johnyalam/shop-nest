import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { getError } from '../utils/getError'
import { authConfig } from '../utils/authConfig'

// --- Async actions (talk to the API) ---

export const listProducts = createAsyncThunk(
  'products/list',
  async ({ keyword = '', page = 1 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/products/', { params: { keyword, page } })
      return data // { products, page, pages }
    } catch (err) {
      return rejectWithValue(getError(err))
    }
  }
)

export const getProductDetails = createAsyncThunk(
  'products/details',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/products/${id}/`)
      return data
    } catch (err) {
      return rejectWithValue(getError(err))
    }
  }
)

export const listTopProducts = createAsyncThunk(
  'products/top',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/products/top/')
      return data
    } catch (err) {
      return rejectWithValue(getError(err))
    }
  }
)

export const createReview = createAsyncThunk(
  'products/createReview',
  async ({ id, rating, comment }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `/api/products/${id}/reviews/`, { rating, comment }, authConfig(getState))
      return data // updated product
    } catch (err) {
      return rejectWithValue(getError(err))
    }
  }
)

// --- State and how it changes ---
const initialState = {
  list: { products: [], page: 1, pages: 1, loading: false, error: null },
  details: { product: null, loading: false, error: null },
  top: { products: [], loading: false, error: null },
  review: { loading: false, error: null },
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
        // product list
    .addCase(listProducts.pending, (state) => {
      state.list.loading = true
      state.list.error = null
    })
    .addCase(listProducts.fulfilled, (state, action) => {
      state.list.loading = false
      state.list.products = action.payload.products
      state.list.page = action.payload.page
      state.list.pages = action.payload.pages
    })
    .addCase(listProducts.rejected, (state, action) => {
      state.list.loading = false
      state.list.error = action.payload
    })
    // product details
    .addCase(getProductDetails.pending, (state) => {
      state.details.loading = true
      state.details.error = null
    })
    .addCase(getProductDetails.fulfilled, (state, action) => {
      state.details.loading = false
      state.details.product = action.payload
    })
    .addCase(getProductDetails.rejected, (state, action) => {
      state.details.loading = false
      state.details.error = action.payload
    })
    
    // top products
    .addCase(listTopProducts.pending, (state) => {
      state.top.loading = true
      state.top.error = null
    })
    .addCase(listTopProducts.fulfilled, (state, action) => {
      state.top.loading = false
      state.top.products = action.payload
    })
    .addCase(listTopProducts.rejected, (state, action) => {
      state.top.loading = false
      state.top.error = action.payload
    })
    // review
    .addCase(createReview.pending, (state) => {
      state.review = { loading: true, error: null }
    })
    .addCase(createReview.fulfilled, (state, action) => {
      state.review.loading = false
      state.details.product = action.payload
    })
    .addCase(createReview.rejected, (state, action) => {
      state.review.loading = false
      state.review.error = action.payload
    })
  },
})

export default productSlice.reducer