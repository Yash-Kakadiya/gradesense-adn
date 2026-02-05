import api from './api'
import { API_ENDPOINTS } from '@/utils/constants'

export const authService = {
    /**
     * Login user
     * @param {Object} credentials - { email, password }
     * @returns {Promise} - { token, user }
     */
    login: async (credentials) => {
        const response = await api.post(API_ENDPOINTS.LOGIN, credentials)
        return response
    },

    /**
     * Register new user
     * @param {Object} userData - User registration data
     * @returns {Promise}
     */
    register: async (userData) => {
        const response = await api.post(API_ENDPOINTS.REGISTER, userData)
        return response
    },

    /**
     * Logout user
     * @returns {Promise}
     */
    logout: async () => {
        try {
            await api.post(API_ENDPOINTS.LOGOUT)
        } finally {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        }
    },

    /**
     * Get current user from token
     * @returns {Object|null}
     */
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user')
        if (userStr) {
            try {
                return JSON.parse(userStr)
            } catch {
                return null
            }
        }
        return null
    },

    /**
     * Get token from storage
     * @returns {string|null}
     */
    getToken: () => {
        return localStorage.getItem('token')
    },

    /**
     * Save auth data to storage
     * @param {string} token
     * @param {Object} user
     */
    saveAuthData: (token, user) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
    },

    /**
     * Clear auth data
     */
    clearAuthData: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated: () => {
        const token = localStorage.getItem('token')
        return !!token
    },

    /**
     * Check if user has specific role
     * @param {string} role
     * @returns {boolean}
     */
    hasRole: (role) => {
        const user = authService.getCurrentUser()
        return user?.role === role
    },
}
