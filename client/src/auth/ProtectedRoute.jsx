import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth.js'

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="container py-5">
        <div className="alert alert-info" role="status">
          Loading…
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />
  }

  return <Outlet />
}
