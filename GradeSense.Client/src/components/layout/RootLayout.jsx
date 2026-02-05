import { Outlet } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'

/**
 * Root layout that wraps all routes with AuthProvider
 * This ensures useNavigate is available within AuthProvider
 */
const RootLayout = () => {
    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    )
}

export default RootLayout
