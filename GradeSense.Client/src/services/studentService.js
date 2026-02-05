import api from './api'
import { API_ENDPOINTS } from '@/utils/constants'

export const studentService = {
    /**
     * Get all students with pagination and filters
     * @param {Object} params - { pageNumber, pageSize, searchTerm, batchId, departmentId, isActive }
     * @returns {Promise}
     */
    getAll: (params = {}) => {
        // Map search to searchTerm for backend compatibility
        const { search, ...rest } = params
        const mappedParams = { ...rest }
        if (search) mappedParams.searchTerm = search
        return api.get(API_ENDPOINTS.STUDENTS, { params: mappedParams })
    },

    /**
     * Get student by ID
     * @param {number} id
     * @returns {Promise}
     */
    getById: (id) => {
        return api.get(`${API_ENDPOINTS.STUDENTS}/${id}`)
    },

    /**
     * Create new student
     * @param {Object} data
     * @returns {Promise}
     */
    create: (data) => {
        return api.post(API_ENDPOINTS.STUDENTS, data)
    },

    /**
     * Update student
     * @param {number} id
     * @param {Object} data
     * @returns {Promise}
     */
    update: (id, data) => {
        return api.put(`${API_ENDPOINTS.STUDENTS}/${id}`, data)
    },

    /**
     * Delete student (soft delete)
     * @param {number} id
     * @returns {Promise}
     */
    delete: (id) => {
        return api.delete(`${API_ENDPOINTS.STUDENTS}/${id}`)
    },

    /**
     * Get all students for select dropdown
     * @param {number} batchId - Optional filter by batch
     * @returns {Promise}
     */
    getAllForSelect: (batchId = null) => {
        const params = { pageSize: 1000 }
        if (batchId) params.batchId = batchId
        return api.get(API_ENDPOINTS.STUDENTS, { params })
    },

    /**
     * Get student enrollments
     * @param {number} id
     * @returns {Promise}
     */
    getEnrollments: (id) => {
        return api.get(`${API_ENDPOINTS.STUDENTS}/${id}/enrollments`)
    },

    /**
     * Get student grades
     * @param {number} id
     * @returns {Promise}
     */
    getGrades: (id) => {
        return api.get(`${API_ENDPOINTS.STUDENTS}/${id}/grades`)
    },

    /**
     * Get student attendance
     * @param {number} id
     * @returns {Promise}
     */
    getAttendance: (id) => {
        return api.get(`${API_ENDPOINTS.STUDENTS}/${id}/attendance`)
    },
}
