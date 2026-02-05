import api from './api'
import { API_ENDPOINTS } from '@/utils/constants'

export const batchService = {
    /**
     * Get all batches with pagination and filters
     * @param {Object} params - { pageNumber, pageSize, search, departmentId, isActive }
     * @returns {Promise}
     */
    getAll: (params = {}) => {
        return api.get(API_ENDPOINTS.BATCHES, { params })
    },

    /**
     * Get batch by ID
     * @param {number} id
     * @returns {Promise}
     */
    getById: (id) => {
        return api.get(`${API_ENDPOINTS.BATCHES}/${id}`)
    },

    /**
     * Create new batch
     * @param {Object} data
     * @returns {Promise}
     */
    create: (data) => {
        return api.post(API_ENDPOINTS.BATCHES, data)
    },

    /**
     * Update batch
     * @param {number} id
     * @param {Object} data
     * @returns {Promise}
     */
    update: (id, data) => {
        return api.put(`${API_ENDPOINTS.BATCHES}/${id}`, data)
    },

    /**
     * Delete batch (soft delete)
     * @param {number} id
     * @returns {Promise}
     */
    delete: (id) => {
        return api.delete(`${API_ENDPOINTS.BATCHES}/${id}`)
    },

    /**
     * Get all batches for select dropdown
     * @param {number} departmentId - Optional filter by department
     * @returns {Promise}
     */
    getAllForSelect: (departmentId = null) => {
        const params = { pageSize: 1000 }
        if (departmentId) params.departmentId = departmentId
        return api.get(API_ENDPOINTS.BATCHES, { params })
    },
}
