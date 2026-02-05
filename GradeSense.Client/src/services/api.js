import axios from 'axios'
import { API_URL } from '@/utils/constants'
import toast from 'react-hot-toast'

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
        return response.data
    },
    (error) => {
        const { response } = error

        if (response) {
            switch (response.status) {
                case 401:
                    // Unauthorized - clear token and redirect to login
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login'
                        toast.error('Session expired. Please login again.')
                    }
                    break
                case 403:
                    toast.error('You do not have permission to perform this action.')
                    break
                case 404:
                    toast.error('The requested resource was not found.')
                    break
                case 422:
                    // Validation errors - handled by the calling component
                    break
                case 500:
                    toast.error('An unexpected server error occurred.')
                    break
                default:
                    toast.error(response.data?.message || 'An error occurred.')
            }
        } else if (error.request) {
            toast.error('Unable to connect to the server. Please check your connection.')
        } else {
            toast.error('An unexpected error occurred.')
        }

        return Promise.reject(error)
    }
)

export default api
