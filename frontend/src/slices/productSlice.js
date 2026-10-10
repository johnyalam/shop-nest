import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { getError } from '../utils/getError'

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

// --- State and how it changes ---

const initialState = {
  list: { products: [], page: 1, pages: 1, loading: false, error: null },
  details: { product: null, loading: false, error: null },
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
      // single product
      .addCase(getProductDetails.pending, (state) => {
        state.details.loading = true
        state.details.error = null
        state.details.product = null
      })
      .addCase(getProductDetails.fulfilled, (state, action) => {
        state.details.loading = false
        state.details.product = action.payload
      })
      .addCase(getProductDetails.rejected, (state, action) => {
        state.details.loading = false
        state.details.error = action.payload
      })
  },
})

export default productSlice.reducer