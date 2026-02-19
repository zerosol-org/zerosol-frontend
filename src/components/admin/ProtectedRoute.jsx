// src/components/admin/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAdminAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}