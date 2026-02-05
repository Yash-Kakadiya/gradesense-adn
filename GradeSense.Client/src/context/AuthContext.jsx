import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { jwtDecode } from 'jwt-decode'
import { authService } from '@/services/authService'
import { ROUTES, ROLES } from '@/utils/constants'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    // Initialize auth state from localStorage
    useEffect(() => {
        const initAuth = () => {
            const storedToken = authService.getToken()
            const storedUser = authService.getCurrentUser()

            if (storedToken && storedUser) {
                try {
                    const decoded = jwtDecode(storedToken)
                    const isExpired = decoded.exp * 1000 < Date.now()

                    if (isExpired) {
                        authService.clearAuthData()
                        setToken(null)
                        setUser(null)
                    } else {
                        setToken(storedToken)
                        setUser(storedUser)
                    }
                } catch {
                    authService.clearAuthData()
                    setToken(null)
                    setUser(null)
                }
            }
            setLoading(false)
        }

        initAuth()
    }, [])

    // Login function - returns user info for navigation
    const login = useCallback(async (credentials) => {
        try {
            const response = await authService.login(credentials)

            // API returns PascalCase: { Success, Message, Data: { Token, RefreshToken, ExpiresAt, User } }
            if (!response.Success) {
                throw new Error(response.Message || 'Login failed')
            }

            const { Token: newToken, User: userData } = response.Data

            // Decode token to get user info if not provided
            const decoded = jwtDecode(newToken)
            const userInfo = userData ? {
                id: userData.Id,
                email: userData.Email,
                personalEmail: userData.PersonalEmail,
                institutionalEmail: userData.InstitutionalEmail,
                phoneNumber: userData.PhoneNumber,
                fullName: userData.FullName,
                role: userData.Role,
                isActive: userData.IsActive,
                profileImagePath: userData.ProfileImagePath,
                createdAt: userData.CreatedAt,
                updatedAt: userData.UpdatedAt,
            } : {
                id: decoded.nameid || decoded.sub,
                email: decoded.email,
                fullName: decoded.unique_name || decoded.name,
                role: decoded.role,
            }

            authService.saveAuthData(newToken, userInfo)
            setToken(newToken)
            setUser(userInfo)

            toast.success(`Welcome back, ${userInfo.fullName || userInfo.email}!`)

            // Return success with redirect path based on role
            let redirectPath = ROUTES.LOGIN
            switch (userInfo.role) {
                case ROLES.ADMIN:
                    redirectPath = ROUTES.ADMIN_DASHBOARD
                    break
                case ROLES.FACULTY:
                    redirectPath = ROUTES.FACULTY_DASHBOARD
                    break
                case ROLES.STUDENT:
                    redirectPath = ROUTES.STUDENT_DASHBOARD
                    break
            }

            return { success: true, redirectPath }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed'
            toast.error(message)
            return { success: false, error: message }
        }
    }, [])

    // Logout function - returns true when complete
    const logout = useCallback(async () => {
        try {
            await authService.logout()
        } catch {
            // Silently handle logout errors
        } finally {
            setToken(null)
            setUser(null)
            toast.success('Logged out successfully')
            return true
        }
    }, [])

    // Check if user has specific role
    const hasRole = useCallback((role) => {
        if (Array.isArray(role)) {
            return role.includes(user?.role)
        }
        return user?.role === role
    }, [user])

    // Check if user is authenticated
    const isAuthenticated = !!token && !!user

    // Get dashboard route based on role
    const getDashboardRoute = useCallback(() => {
        switch (user?.role) {
            case ROLES.ADMIN:
                return ROUTES.ADMIN_DASHBOARD
            case ROLES.FACULTY:
                return ROUTES.FACULTY_DASHBOARD
            case ROLES.STUDENT:
                return ROUTES.STUDENT_DASHBOARD
            default:
                return ROUTES.LOGIN
        }
    }, [user])

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        hasRole,
        isAuthenticated,
        getDashboardRoute,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export default AuthContext
