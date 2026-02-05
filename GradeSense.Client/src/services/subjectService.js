import api from './api'
import { API_ENDPOINTS } from '@/utils/constants'

export const subjectService = {
    /**
     * Get all subjects with pagination and filters
     * @param {Object} params - { pageNumber, pageSize, searchTerm, departmentId, semester, subjectType, isElective, isActive, sortBy, sortOrder }
     * @returns {Promise}
     */
    getAll: (params = {}) => {
        return api.get(API_ENDPOINTS.SUBJECTS, { params })
    },

    /**
     * Get subject by ID
     * @param {number} id
     * @returns {Promise}
     */
    getById: (id) => {
        return api.get(`${API_ENDPOINTS.SUBJECTS}/${id}`)
    },

    /**
     * Create new subject
     * @param {Object} data
     * @returns {Promise}
     */
    create: (data) => {
        return api.post(API_ENDPOINTS.SUBJECTS, data)
    },

    /**
     * Update subject
     * @param {number} id
     * @param {Object} data
     * @returns {Promise}
     */
    update: (id, data) => {
        return api.put(`${API_ENDPOINTS.SUBJECTS}/${id}`, data)
    },

    /**
     * Delete subject (soft delete)
     * @param {number} id
     * @returns {Promise}
     */
    delete: (id) => {
        return api.delete(`${API_ENDPOINTS.SUBJECTS}/${id}`)
    },

    /**
     * Get all subjects for select dropdown
     * @param {number} departmentId - Optional filter by department
     * @returns {Promise}
     */
    getAllForSelect: (departmentId = null) => {
        const params = { pageSize: 1000 }
        if (departmentId) params.departmentId = departmentId
        return api.get(API_ENDPOINTS.SUBJECTS, { params })
    },
}
