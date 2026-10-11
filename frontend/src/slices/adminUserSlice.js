import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { getError } from '../utils/getError'
import { authConfig } from '../utils/authConfig'
import { logout } from './userSlice'

export const listUsers = createAsyncThunk(
  'adminUsers/list',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/users/', authConfig(getState))
      return data
    } catch (err) {
      return rejectWithValue(getError(err))
    }
  }
)

export const getUser = createAsyncThunk(
  'adminUsers/get',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/users/${id}/`, authConfig(getState))
      return data
    } catch (err) {
      return rejectWithValue(getError(err))
    }
  }
)

export const updateUser = createAsyncThunk(
  'adminUsers/update',
  async ({ id, ...fields }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.put(`/api/users/${id}/update/`, fields, authConfig(getState))
      return data
    } catch (err) {
      return rejectWithValue(getError(err))
    }
  }
)

export const deleteUser = createAsyncThunk(
  'adminUsers/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      await axios.delete(`/api/users/${id}/delete/`, authConfig(getState))
      return id
    } catch (err) {
      return rejectWithValue(getError(err))
    }
  }
)

const initialState = {
  list: { users: [], loading: false, error: null },
  edit: { user: null, loading: false, error: null },
  update: { loading: false, error: null, success: false },
  deleteError: null,
}

const adminUserSlice = createSlice({
  name: 'adminUsers',
  initialState,
  reducers: {
    resetUserUpdate(state) {
      state.update = initialState.update
    },
  },
  extraReducers: (builder) => {
    builder
      // list
      .addCase(listUsers.pending, (state) => {
        state.list.loading = true
        state.list.error = null
        state.deleteError = null
      })
      .addCase(listUsers.fulfilled, (state, action) => {
        state.list.loading = false
        state.list.users = action.payload
      })
      .addCase(listUsers.rejected, (state, action) => {
        state.list.loading = false
        state.list.error = action.payload
      })
      // get one
      .addCase(getUser.pending, (state) => {
        state.edit = { user: null, loading: true, error: null }
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.edit.loading = false
        state.edit.user = action.payload
      })
      .addCase(getUser.rejected, (state, action) => {
        state.edit.loading = false
        state.edit.error = action.payload
      })
      // update
      .addCase(updateUser.pending, (state) => {
        state.update = { loading: true, error: null, success: false }
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.update = { loading: false, error: null, success: true }
        state.edit.user = action.payload
        state.list.users = state.list.users.map((u) =>
          u._id === action.payload._id ? action.payload : u)
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.update = { loading: false, error: action.payload, success: false }
      })
      // delete
      .addCase(deleteUser.pending, (state) => {
        state.deleteError = null
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list.users = state.list.users.filter((u) => u._id !== action.payload)
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.deleteError = action.payload
      })
      // forget all admin data on logout
      .addCase(logout, () => initialState)
  },
})

export const { resetUserUpdate } = adminUserSlice.actions
export default adminUserSlice.reducer