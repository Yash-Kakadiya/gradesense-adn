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
     * Get enrollments by course offering
     * @param {number} courseOfferingId
     * @returns {Promise}
     */
    getByCourseOffering: (courseOfferingId) => {
        return api.get(API_ENDPOINTS.COURSE_ENROLLMENTS, {
            params: { courseOfferingId, pageSize: 500 }
        })
    },

    /**
     * Get enrollments by student
     * @param {number} studentId
     * @returns {Promise}
     */
    getByStudent: (studentId) => {
        return api.get(API_ENDPOINTS.COURSE_ENROLLMENTS, {
            params: { studentId, pageSize: 100 }
        })
    },

    /**
     * Bulk enroll students
     * @param {Object} data - { courseOfferingId, studentIds }
     * @returns {Promise}
     */
    bulkEnroll: (data) => {
        return api.post(`${API_ENDPOINTS.COURSE_ENROLLMENTS}/bulk`, data)
    },

    /**
     * Download Excel template for enrollment import
     * @param {number} courseOfferingId
     * @returns {Promise<Blob>}
     */
    getTemplateExcel: async (courseOfferingId) => {
        const response = await api.get(`${API_ENDPOINTS.COURSE_ENROLLMENTS}/import/template/excel/${courseOfferingId}`, {
            responseType: 'blob'
        })
        return response
    },

    /**
     * Validate enrollment import file and get preview
     * @param {number} courseOfferingId
     * @param {File} file
     * @returns {Promise}
     */
    validateImport: (courseOfferingId, file) => {
        const formData = new FormData()
        formData.append('file', file)
        return api.post(`${API_ENDPOINTS.COURSE_ENROLLMENTS}/import/validate`, formData, {
            params: { courseOfferingId },
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    /**
     * Execute enrollment import with conflict resolution
     * @param {Object} data - { courseOfferingId, conflictResolution, rows }
     * @returns {Promise}
     */
    executeImport: (data) => {
        return api.post(`${API_ENDPOINTS.COURSE_ENROLLMENTS}/import/execute`, data)
    },
}
