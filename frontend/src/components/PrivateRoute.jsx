import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

function PrivateRoute() {
  const { userInfo } = useSelector((state) => state.user)
  const location = useLocation()

  return userInfo ? (
    <Outlet />
  ) : (
    <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  )
}

export default PrivateRoute