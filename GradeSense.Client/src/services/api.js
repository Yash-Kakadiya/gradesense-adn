import axios from 'axios'
import { API_URL } from '@/utils/constants'
import toast from 'react-hot-toast'
import { parseApiError } from '@/utils/errorHandler'

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
})

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => {
        // For blob responses, return full response to access headers for filename
        if (response.config?.responseType === 'blob') {
            return response
        }
        return response.data
    },
    (error) => {
        const parsed = parseApiError(error)

        // Handle specific error types
        if (parsed.isAuthError && error?.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
                toast.error(parsed.message)
            }
            return Promise.reject(error)
        }

        if (parsed.isAuthError && error?.response?.status === 403) {
            toast.error(parsed.message)
            return Promise.reject(error)
        }

        // For validation errors (400, 422), don't show toast here
        // Let the component handle it for better UX
        if (parsed.isValidationError) {
            return Promise.reject(error)
        }

        // Network errors
        if (parsed.isNetworkError) {
            toast.error(parsed.message)
            return Promise.reject(error)
        }

        // Server errors (500+)
        if (error?.response?.status >= 500) {
            toast.error(parsed.message)
            return Promise.reject(error)
        }

        // For 404, don't show toast automatically - let component decide
        if (error?.response?.status === 404) {
            return Promise.reject(error)
        }

        // Other errors - show generic message
        if (error?.response?.status && error.response.status !== 400 && error.response.status !== 422) {
            toast.error(parsed.message)
        }

        return Promise.reject(error)
    }
)

export default api
