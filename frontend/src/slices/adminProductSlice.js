import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { getError } from '../utils/getError'
import { authConfig } from '../utils/authConfig'
import { logout } from './userSlice'

export const createProduct = createAsyncThunk(
  'adminProducts/create',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.post('/api/products/create/', {}, authConfig(getState))
      return data
    } catch (err) {
      return rejectWithValue(getError(err))
    }
  }
)

export const updateProduct = createAsyncThunk(
  'adminProducts/update',
  async ({ id, ...fields }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.put(`/api/products/${id}/update/`, fields, authConfig(getState))
      return data
    } catch (err) {
      return rejectWithValue(getError(err))
    }
  }
)

export const deleteProduct = createAsyncThunk(
  'adminProducts/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      await axios.delete(`/api/products/${id}/delete/`, authConfig(getState))
      return id
    } catch (err) {
      return rejectWithValue(getError(err))
    }
  }
)

export const uploadProductImage = createAsyncThunk(
  'adminProducts/upload',
  async ({ id, file }, { getState, rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append('image', file)
      const { data } = await axios.post(`/api/products/${id}/upload/`, formData, authConfig(getState))
      return data
    } catch (err) {
      return rejectWithValue(getError(err))
    }
  }
)

const initialState = {
  loading: false,
  error: null,
  uploading: false,
  uploadError: null,
}

const adminProductSlice = createSlice({
  name: 'adminProducts',
  initialState,
  reducers: {
    clearAdminProductErrors(state) {
      state.error = null
      state.uploadError = null
    },
  },
  extraReducers: (builder) => {
    // create / update / delete share one loading + error
    for (const thunk of [createProduct, updateProduct, deleteProduct]) {
      builder
        .addCase(thunk.pending, (state) => {
          state.loading = true
          state.error = null
        })
        .addCase(thunk.fulfilled, (state) => {
          state.loading = false
        })
        .addCase(thunk.rejected, (state, action) => {
          state.loading = false
          state.error = action.payload
        })
    }
    builder
      .addCase(uploadProductImage.pending, (state) => {
        state.uploading = true
        state.uploadError = null
      })
      .addCase(uploadProductImage.fulfilled, (state) => {
        state.uploading = false
      })
      .addCase(uploadProductImage.rejected, (state, action) => {
        state.uploading = false
        state.uploadError = action.payload
      })
      .addCase(logout, () => initialState)
  },
})

export const { clearAdminProductErrors } = adminProductSlice.actions
export default adminProductSlice.reducer