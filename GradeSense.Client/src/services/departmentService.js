import api from './api'
import { API_ENDPOINTS } from '@/utils/constants'

export const departmentService = {
    /**
     * Get all departments with pagination and filters
     * @param {Object} params - { pageNumber, pageSize, search, isActive }
     * @returns {Promise}
     */
    getAll: (params = {}) => {
        return api.get(API_ENDPOINTS.DEPARTMENTS, { params })
    },

    /**
     * Get department by ID
     * @param {number} id
     * @returns {Promise}
     */
    getById: (id) => {
        return api.get(`${API_ENDPOINTS.DEPARTMENTS}/${id}`)
    },

    /**
     * Create new department
     * @param {Object} data
     * @returns {Promise}
     */
    create: (data) => {
        return api.post(API_ENDPOINTS.DEPARTMENTS, data)
    },

    /**
     * Update department
     * @param {number} id
     * @param {Object} data
     * @returns {Promise}
     */
    update: (id, data) => {
        return api.put(`${API_ENDPOINTS.DEPARTMENTS}/${id}`, data)
    },

    /**
     * Delete department (soft delete)
     * @param {number} id
     * @returns {Promise}
     */
    delete: (id) => {
        return api.delete(`${API_ENDPOINTS.DEPARTMENTS}/${id}`)
    },

    /**
     * Get all departments (no pagination - for dropdowns)
     * @returns {Promise}
     */
    getAllForSelect: () => {
        return api.get(API_ENDPOINTS.DEPARTMENTS, { params: { pageSize: 1000 } })
    },
}
