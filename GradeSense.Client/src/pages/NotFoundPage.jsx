import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/common'
import { Home, ArrowLeft } from 'lucide-react'

const NotFoundPage = () => {
    const { isAuthenticated, getDashboardRoute } = useAuth()

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-gray-200">404</h1>
                <h2 className="text-2xl font-semibold text-gray-900 mt-4">
                    Page Not Found
                </h2>
                <p className="text-gray-600 mt-2 max-w-md mx-auto">
                    The page you are looking for might have been removed, had its name
                    changed, or is temporarily unavailable.
                </p>
                <div className="flex items-center justify-center gap-4 mt-8">
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                    <Link to={isAuthenticated ? getDashboardRoute() : '/login'}>
                        <Button>
                            <Home className="w-4 h-4 mr-2" />
                            {isAuthenticated ? 'Dashboard' : 'Login'}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default NotFoundPage
