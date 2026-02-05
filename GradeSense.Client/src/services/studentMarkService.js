import api from './api'
import { API_ENDPOINTS } from '@/utils/constants'

export const studentMarkService = {
    /**
     * Get all student marks with pagination and filters
     * @param {Object} params - { pageNumber, pageSize, studentId, assessmentItemId, courseEnrollmentId }
     * @returns {Promise}
     */
    getAll: (params = {}) => {
        return api.get(API_ENDPOINTS.STUDENT_MARKS, { params })
    },

    /**
     * Get student mark by ID
     * @param {number} id
     * @returns {Promise}
     */
    getById: (id) => {
        return api.get(`${API_ENDPOINTS.STUDENT_MARKS}/${id}`)
    },

    /**
     * Create new student mark
     * @param {Object} data
     * @returns {Promise}
     */
    create: (data) => {
        return api.post(API_ENDPOINTS.STUDENT_MARKS, data)
    },

    /**
     * Update student mark
     * @param {number} id
     * @param {Object} data
     * @returns {Promise}
     */
    update: (id, data) => {
        return api.put(`${API_ENDPOINTS.STUDENT_MARKS}/${id}`, data)
    },

    /**
     * Delete student mark (soft delete)
     * @param {number} id
     * @returns {Promise}
     */
    delete: (id) => {
        return api.delete(`${API_ENDPOINTS.STUDENT_MARKS}/${id}`)
    },

    /**
     * Bulk entry for student marks
     * @param {Object} data - { assessmentItemId, marks: [{ studentId, marksObtained }] }
     * @returns {Promise}
     */
    bulkEntry: (data) => {
        return api.post(`${API_ENDPOINTS.STUDENT_MARKS}/bulk`, data)
    },

    /**
     * Get marks by course offering
     * @param {number} courseOfferingId
     * @returns {Promise}
     */
    getByCourseOffering: (courseOfferingId) => {
        return api.get(`${API_ENDPOINTS.STUDENT_MARKS}/course-offering/${courseOfferingId}`)
    },
}
