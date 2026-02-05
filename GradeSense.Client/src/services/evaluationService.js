import api from './api'
import { API_ENDPOINTS } from '@/utils/constants'

export const evaluationSchemeService = {
    /**
     * Get all evaluation schemes with pagination and filters
     * @param {Object} params - { pageNumber, pageSize, courseOfferingId }
     * @returns {Promise}
     */
    getAll: (params = {}) => {
        return api.get(API_ENDPOINTS.EVALUATION_SCHEMES, { params })
    },

    /**
     * Get evaluation scheme by ID
     * @param {number} id
     * @returns {Promise}
     */
    getById: (id) => {
        return api.get(`${API_ENDPOINTS.EVALUATION_SCHEMES}/${id}`)
    },

    /**
     * Create new evaluation scheme
     * @param {Object} data
     * @returns {Promise}
     */
    create: (data) => {
        return api.post(API_ENDPOINTS.EVALUATION_SCHEMES, data)
    },

    /**
     * Update evaluation scheme
     * @param {number} id
     * @param {Object} data
     * @returns {Promise}
     */
    update: (id, data) => {
        return api.put(`${API_ENDPOINTS.EVALUATION_SCHEMES}/${id}`, data)
    },

    /**
     * Delete evaluation scheme (soft delete)
     * @param {number} id
     * @returns {Promise}
     */
    delete: (id) => {
        return api.delete(`${API_ENDPOINTS.EVALUATION_SCHEMES}/${id}`)
    },
}

export const assessmentItemService = {
    /**
     * Get all assessment items with pagination and filters
     * @param {Object} params - { pageNumber, pageSize, evaluationSchemeId, assessmentType }
     * @returns {Promise}
     */
    getAll: (params = {}) => {
        return api.get(API_ENDPOINTS.ASSESSMENT_ITEMS, { params })
    },

    /**
     * Get assessment item by ID
     * @param {number} id
     * @returns {Promise}
     */
    getById: (id) => {
        return api.get(`${API_ENDPOINTS.ASSESSMENT_ITEMS}/${id}`)
    },

    /**
     * Create new assessment item
     * @param {Object} data
     * @returns {Promise}
     */
    create: (data) => {
        return api.post(API_ENDPOINTS.ASSESSMENT_ITEMS, data)
    },

    /**
     * Update assessment item
     * @param {number} id
     * @param {Object} data
     * @returns {Promise}
     */
    update: (id, data) => {
        return api.put(`${API_ENDPOINTS.ASSESSMENT_ITEMS}/${id}`, data)
    },

    /**
     * Delete assessment item (soft delete)
     * @param {number} id
     * @returns {Promise}
     */
    delete: (id) => {
        return api.delete(`${API_ENDPOINTS.ASSESSMENT_ITEMS}/${id}`)
    },

    /**
     * Get assessment items by evaluation scheme
     * @param {number} evaluationSchemeId
     * @returns {Promise}
     */
    getByEvaluationScheme: (evaluationSchemeId) => {
        return api.get(API_ENDPOINTS.ASSESSMENT_ITEMS, {
            params: { evaluationSchemeId, pageSize: 1000 }
        })
    },
}
