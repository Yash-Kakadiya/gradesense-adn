import api from './api'
import { API_ENDPOINTS } from '@/utils/constants'

export const courseOfferingService = {
    /**
     * Get all course offerings with pagination and filters
     * @param {Object} params - { pageNumber, pageSize, subjectId, batchId, academicYear, semester }
     * @returns {Promise}
     */
    getAll: (params = {}) => {
        return api.get(API_ENDPOINTS.COURSE_OFFERINGS, { params })
    },

    /**
     * Get course offering by ID
     * @param {number} id
     * @returns {Promise}
     */
    getById: (id) => {
        return api.get(`${API_ENDPOINTS.COURSE_OFFERINGS}/${id}`)
    },

    /**
     * Create new course offering
     * @param {Object} data
     * @returns {Promise}
     */
    create: (data) => {
        return api.post(API_ENDPOINTS.COURSE_OFFERINGS, data)
    },

    /**
     * Update course offering
     * @param {number} id
     * @param {Object} data
     * @returns {Promise}
     */
    update: (id, data) => {
        return api.put(`${API_ENDPOINTS.COURSE_OFFERINGS}/${id}`, data)
    },

    /**
     * Delete course offering (soft delete)
     * @param {number} id
     * @returns {Promise}
     */
    delete: (id) => {
        return api.delete(`${API_ENDPOINTS.COURSE_OFFERINGS}/${id}`)
    },

    /**
     * Get enrolled students for a course offering
     * @param {number} id
     * @returns {Promise}
     */
    getEnrolledStudents: (id) => {
        return api.get(`${API_ENDPOINTS.COURSE_OFFERINGS}/${id}/students`)
    },

    /**
     * Get all course offerings for select dropdown
     * @returns {Promise}
     */
    getAllForSelect: () => {
        return api.get(API_ENDPOINTS.COURSE_OFFERINGS, { params: { pageSize: 1000 } })
    },
}
