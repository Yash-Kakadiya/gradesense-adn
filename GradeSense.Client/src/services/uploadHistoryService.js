import api from './api'
import { API_ENDPOINTS } from '@/utils/constants'

const uploadHistoryService = {
    /**
     * Get all upload histories with pagination
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Paginated upload histories list
     */
    getAll: async (params = {}) => {
        const response = await api.get(API_ENDPOINTS.UPLOAD_HISTORIES, { params })
        return response.data
    },

    /**
     * Get an upload history by ID
     * @param {number} id - Upload History ID
     * @returns {Promise<Object>} Upload history details
     */
    getById: async (id) => {
        const response = await api.get(`${API_ENDPOINTS.UPLOAD_HISTORIES}/${id}`)
        return response.data
    },

    /**
     * Get upload histories by user
     * @param {number} userId - User ID
     * @param {Object} params - Query parameters
     * @returns {Promise<Array>} User's upload histories
     */
    getByUser: async (userId, params = {}) => {
        const response = await api.get(`${API_ENDPOINTS.UPLOAD_HISTORIES}/user/${userId}`, { params })
        return response.data
    },

    /**
     * Get upload histories by type
     * @param {string} uploadType - Upload type (students, marks, attendance, etc.)
     * @param {Object} params - Query parameters
     * @returns {Promise<Array>} Upload histories of specific type
     */
    getByType: async (uploadType, params = {}) => {
        const response = await api.get(`${API_ENDPOINTS.UPLOAD_HISTORIES}/type/${uploadType}`, { params })
        return response.data
    },

    /**
     * Delete an upload history
     * @param {number} id - Upload History ID
     * @returns {Promise<void>}
     */
    delete: async (id) => {
        await api.delete(`${API_ENDPOINTS.UPLOAD_HISTORIES}/${id}`)
    },
}

export default uploadHistoryService
