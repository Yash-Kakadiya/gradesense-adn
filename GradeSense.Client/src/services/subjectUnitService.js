import api from './api'
import { API_ENDPOINTS } from '@/utils/constants'

export const subjectUnitService = {
    /**
     * Get all subject units with pagination and filters
     * @param {Object} params - { pageNumber, pageSize, subjectId, searchTerm }
     * @returns {Promise}
     */
    getAll: (params = {}) => {
        return api.get(API_ENDPOINTS.SUBJECT_UNITS, { params })
    },

    /**
     * Get subject unit by ID
     * @param {number} id
     * @returns {Promise}
     */
    getById: (id) => {
        return api.get(`${API_ENDPOINTS.SUBJECT_UNITS}/${id}`)
    },

    /**
     * Create new subject unit
     * @param {Object} data - { subjectId, unitNumber, name, description, hours }
     * @returns {Promise}
     */
    create: (data) => {
        return api.post(API_ENDPOINTS.SUBJECT_UNITS, data)
    },

    /**
     * Update subject unit
     * @param {number} id
     * @param {Object} data
     * @returns {Promise}
     */
    update: (id, data) => {
        return api.put(`${API_ENDPOINTS.SUBJECT_UNITS}/${id}`, data)
    },

    /**
     * Delete subject unit (soft delete)
     * @param {number} id
     * @returns {Promise}
     */
    delete: (id) => {
        return api.delete(`${API_ENDPOINTS.SUBJECT_UNITS}/${id}`)
    },

    /**
     * Get units by subject ID
     * @param {number} subjectId
     * @returns {Promise}
     */
    getBySubject: (subjectId) => {
        return api.get(API_ENDPOINTS.SUBJECT_UNITS, {
            params: { subjectId, pageSize: 100 }
        })
    },
}
