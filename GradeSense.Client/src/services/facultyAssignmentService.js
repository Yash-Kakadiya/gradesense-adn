import api from './api'
import { API_ENDPOINTS } from '@/utils/constants'

export const facultyAssignmentService = {
    /**
     * Get all faculty assignments with pagination and filters
     * @param {Object} params - { pageNumber, pageSize, facultyId, courseOfferingId }
     * @returns {Promise}
     */
    getAll: (params = {}) => {
        return api.get(API_ENDPOINTS.FACULTY_ASSIGNMENTS, { params })
    },

    /**
     * Get faculty assignment by ID
     * @param {number} id
     * @returns {Promise}
     */
    getById: (id) => {
        return api.get(`${API_ENDPOINTS.FACULTY_ASSIGNMENTS}/${id}`)
    },

    /**
     * Create new faculty assignment
     * @param {Object} data
     * @returns {Promise}
     */
    create: (data) => {
        return api.post(API_ENDPOINTS.FACULTY_ASSIGNMENTS, data)
    },

    /**
     * Update faculty assignment
     * @param {number} id
     * @param {Object} data
     * @returns {Promise}
     */
    update: (id, data) => {
        return api.put(`${API_ENDPOINTS.FACULTY_ASSIGNMENTS}/${id}`, data)
    },

    /**
     * Delete faculty assignment (soft delete)
     * @param {number} id
     * @returns {Promise}
     */
    delete: (id) => {
        return api.delete(`${API_ENDPOINTS.FACULTY_ASSIGNMENTS}/${id}`)
    },

    /**
     * Get assignments by faculty ID
     * @param {number} facultyId
     * @returns {Promise}
     */
    getByFaculty: (facultyId) => {
        return api.get(API_ENDPOINTS.FACULTY_ASSIGNMENTS, {
            params: { facultyId, pageSize: 100 }
        })
    },

    /**
     * Get assignments by course offering
     * @param {number} courseOfferingId
     * @returns {Promise}
     */
    getByCourseOffering: (courseOfferingId) => {
        return api.get(API_ENDPOINTS.FACULTY_ASSIGNMENTS, {
            params: { courseOfferingId, pageSize: 100 }
        })
    },
}
