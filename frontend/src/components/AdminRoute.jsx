import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

function AdminRoute() {
  const { userInfo } = useSelector((state) => state.user)
  const location = useLocation()

  if (!userInfo) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }
  return userInfo.isAdmin ? <Outlet /> : <Navigate to="/" replace />
}

export default AdminRoute