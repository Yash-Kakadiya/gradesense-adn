import api from './api'
import { API_ENDPOINTS } from '@/utils/constants'

export const courseEnrollmentService = {
    /**
     * Get all course enrollments with pagination and filters
     * @param {Object} params - { pageNumber, pageSize, studentId, courseOfferingId }
     * @returns {Promise}
     */
    getAll: (params = {}) => {
        return api.get(API_ENDPOINTS.COURSE_ENROLLMENTS, { params })
    },

    /**
     * Get course enrollment by ID
     * @param {number} id
     * @returns {Promise}
     */
    getById: (id) => {
        return api.get(`${API_ENDPOINTS.COURSE_ENROLLMENTS}/${id}`)
    },

    /**
     * Create new course enrollment
     * @param {Object} data
     * @returns {Promise}
     */
    create: (data) => {
        return api.post(API_ENDPOINTS.COURSE_ENROLLMENTS, data)
    },

    /**
     * Update course enrollment
     * @param {number} id
     * @param {Object} data
     * @returns {Promise}
     */
    update: (id, data) => {
        return api.put(`${API_ENDPOINTS.COURSE_ENROLLMENTS}/${id}`, data)
    },

    /**
     * Delete course enrollment (soft delete)
     * @param {number} id
     * @returns {Promise}
     */
    delete: (id) => {
        return api.delete(`${API_ENDPOINTS.COURSE_ENROLLMENTS}/${id}`)
    },

    /**
     * Bulk enroll students
     * @param {Object} data - { courseOfferingId, studentIds }
     * @returns {Promise}
     */
    bulkEnroll: (data) => {
        return api.post(`${API_ENDPOINTS.COURSE_ENROLLMENTS}/bulk`, data)
    },
}
