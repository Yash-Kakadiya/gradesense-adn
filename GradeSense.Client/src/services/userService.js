import api from './api'
import { API_ENDPOINTS } from '@/utils/constants'

export const userService = {
    /**
     * Get all users with pagination and filters
     * @param {Object} params - { pageNumber, pageSize, searchTerm, role, isActive }
     * @returns {Promise}
     */
    getAll: (params = {}) => {
        // Map search to searchTerm for backend compatibility
        const { search, ...rest } = params
        const mappedParams = { ...rest }
        if (search) mappedParams.searchTerm = search
        return api.get(API_ENDPOINTS.USERS, { params: mappedParams })
    },

    /**
     * Get user by ID
     * @param {number} id
     * @returns {Promise}
     */
    getById: (id) => {
        return api.get(`${API_ENDPOINTS.USERS}/${id}`)
    },

    /**
     * Create new user
     * @param {Object} data
     * @returns {Promise}
     */
    create: (data) => {
        return api.post(API_ENDPOINTS.USERS, data)
    },

    /**
     * Update user
     * @param {number} id
     * @param {Object} data
     * @returns {Promise}
     */
    update: (id, data) => {
        return api.put(`${API_ENDPOINTS.USERS}/${id}`, data)
    },

    /**
     * Delete user (soft delete)
     * @param {number} id
     * @returns {Promise}
     */
    delete: (id) => {
        return api.delete(`${API_ENDPOINTS.USERS}/${id}`)
    },

    /**
     * Change user password
     * @param {number} id
     * @param {Object} data - { currentPassword, newPassword, confirmPassword }
     * @returns {Promise}
     */
    changePassword: (id, data) => {
        return api.put(`${API_ENDPOINTS.USERS}/${id}/change-password`, {
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
            confirmPassword: data.confirmPassword,
        })
    },

    /**
     * Admin reset user password (without requiring current password)
     * @param {number} id
     * @param {Object} data - { newPassword, confirmPassword }
     * @returns {Promise}
     */
    adminResetPassword: (id, data) => {
        return api.put(`${API_ENDPOINTS.USERS}/${id}/admin-reset-password`, {
            newPassword: data.newPassword,
            confirmPassword: data.confirmPassword,
        })
    },

    /**
     * Activate user
     * @param {number} id
     * @returns {Promise}
     */
    activate: (id) => {
        return api.put(`${API_ENDPOINTS.USERS}/${id}/activate`)
    },

    /**
     * Deactivate user
     * @param {number} id
     * @returns {Promise}
     */
    deactivate: (id) => {
        return api.put(`${API_ENDPOINTS.USERS}/${id}/deactivate`)
    },

    /**
     * Upload profile image
     * @param {number} id
     * @param {File} file
     * @returns {Promise}
     */
    uploadProfileImage: (id, file) => {
        const formData = new FormData()
        formData.append('file', file)
        return api.post(`${API_ENDPOINTS.USERS}/${id}/profile-image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },

    /**
     * Delete profile image
     * @param {number} id
     * @returns {Promise}
     */
    deleteProfileImage: (id) => {
        return api.delete(`${API_ENDPOINTS.USERS}/${id}/profile-image`)
    },

    // --- Bulk Import Methods ---

    /**
     * Download user import template
     * @returns {Promise<Blob>}
     */
    getImportTemplate: async () => {
        const response = await api.get(`${API_ENDPOINTS.USERS}/import/template`, {
            responseType: 'blob',
        })
        return response.data
    },

    /**
     * Validate user import file
     * @param {File} file - Excel or CSV file
     * @returns {Promise}
     */
    validateImport: (file) => {
        const formData = new FormData()
        formData.append('file', file)
        return api.post(`${API_ENDPOINTS.USERS}/import/validate`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },

    /**
     * Execute user import
     * @param {Object} request - { rows: [], conflictResolution: 'skip'|'update'|'error' }
     * @returns {Promise}
     */
    executeImport: (request) => {
        return api.post(`${API_ENDPOINTS.USERS}/import/execute`, request)
    },
}
