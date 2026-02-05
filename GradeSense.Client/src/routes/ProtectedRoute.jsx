import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { LoadingScreen } from '@/components/common'
import { ROUTES } from '@/utils/constants'

/**
 * Protected route - requires authentication
 */
export const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return <LoadingScreen message="Authenticating..." />
    }

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} replace />
    }

    return <Outlet />
}
