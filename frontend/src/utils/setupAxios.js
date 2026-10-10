import axios from 'axios'
import { logout } from '../slices/userSlice'

export function setupAxios(store) {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // 401 while logged in = token expired or invalid → log out
      if (error.response?.status === 401 && store.getState().user.userInfo) {
        store.dispatch(logout())
      }
      return Promise.reject(error)
    }
  )
}