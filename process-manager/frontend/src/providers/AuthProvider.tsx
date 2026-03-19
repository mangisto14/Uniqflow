import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loadFromStorage } = useAuthStore()
  useEffect(() => { loadFromStorage() }, [loadFromStorage])
  return <>{children}</>
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore()
  const location = useLocation()

  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <>{children}</>
}
