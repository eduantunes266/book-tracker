import { Navigate, Outlet } from 'react-router-dom'
import { getToken } from '../api/client'

// Only shows the inner routes if the user has a token; otherwise go to /login
export default function ProtectedRoute() {
  if (!getToken()) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
