import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/utils/constants'

/**
 * Role-based route - restricts access based on user role
 * @param {Object} props
 * @param {string[]} props.allowedRoles - Array of allowed roles
 */
export const RoleBasedRoute = ({ allowedRoles }) => {
    const { user, getDashboardRoute } = useAuth()
    const location = useLocation()

    if (!allowedRoles.includes(user?.role)) {
        // Redirect to user's dashboard if they don't have access
        return <Navigate to={getDashboardRoute()} state={{ from: location }} replace />
    }

    return <Outlet />
}
