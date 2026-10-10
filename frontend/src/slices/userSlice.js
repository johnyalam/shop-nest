import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { getError } from '../utils/getError'
import { authConfig } from '../utils/authConfig'

const loadUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem('userInfo'))
  } catch {
    return null
  }
}

// --- Async actions ---

export const login = createAsyncThunk(
  'user/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('/api/users/login/', { username: email, password })
      return data
    } catch (err) {
      return rejectWithValue(getError(err))
    }
  }
)

export const register = createAsyncThunk(
  'user/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('/api/users/register/', { name, email, password })
      return data
    } catch (err) {
      return rejectWithValue(getError(err))
    }
  }
)

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (fields, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.put('/api/users/profile/update/', fields, authConfig(getState))
      return data
    } catch (err) {
      return rejectWithValue(getError(err))
    }
  }
)

// --- State ---

const initialState = {
  userInfo: loadUserInfo(),
  loading: false,        // login / register
  error: null,
  updateLoading: false,  // profile update
  updateError: null,
  updateSuccess: false,
}

const authPending = (state) => {
  state.loading = true
  state.error = null
}
const authFulfilled = (state, action) => {
  state.loading = false
  state.userInfo = action.payload
}
const authRejected = (state, action) => {
  state.loading = false
  state.error = action.payload
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout(state) {
      state.userInfo = null
      state.error = null
      state.updateError = null
      state.updateSuccess = false
    },
    clearUserMessages(state) {
      state.error = null
      state.updateError = null
      state.updateSuccess = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, authPending)
      .addCase(login.fulfilled, authFulfilled)
      .addCase(login.rejected, authRejected)
      .addCase(register.pending, authPending)
      .addCase(register.fulfilled, authFulfilled)
      .addCase(register.rejected, authRejected)
      .addCase(updateProfile.pending, (state) => {
        state.updateLoading = true
        state.updateError = null
        state.updateSuccess = false
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateLoading = false
        state.updateSuccess = true
        state.userInfo = action.payload // new name/email + fresh token
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = action.payload
      })
  },
})

export const { logout, clearUserMessages } = userSlice.actions
export default userSlice.reducer