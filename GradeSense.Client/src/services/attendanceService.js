import api from './api'
import { API_ENDPOINTS } from '@/utils/constants'

export const attendanceService = {
    /**
     * Get all attendance records with pagination and filters
     * @param {Object} params - { pageNumber, pageSize, studentId, courseOfferingId, fromDate, toDate, status }
     * @returns {Promise}
     */
    getAll: (params = {}) => {
        return api.get(API_ENDPOINTS.ATTENDANCE_RECORDS, { params })
    },

    /**
     * Get attendance record by ID
     * @param {number} id
     * @returns {Promise}
     */
    getById: (id) => {
        return api.get(`${API_ENDPOINTS.ATTENDANCE_RECORDS}/${id}`)
    },

    /**
     * Create new attendance record
     * @param {Object} data
     * @returns {Promise}
     */
    create: (data) => {
        return api.post(API_ENDPOINTS.ATTENDANCE_RECORDS, data)
    },

    /**
     * Update attendance record
     * @param {number} id
     * @param {Object} data
     * @returns {Promise}
     */
    update: (id, data) => {
        return api.put(`${API_ENDPOINTS.ATTENDANCE_RECORDS}/${id}`, data)
    },

    /**
     * Delete attendance record (soft delete)
     * @param {number} id
     * @returns {Promise}
     */
    delete: (id) => {
        return api.delete(`${API_ENDPOINTS.ATTENDANCE_RECORDS}/${id}`)
    },

    /**
     * Bulk mark attendance
     * @param {Object} data - { courseOfferingId, date, records: [{ studentId, status }] }
     * @returns {Promise}
     */
    bulkMark: (data) => {
        return api.post(`${API_ENDPOINTS.ATTENDANCE_RECORDS}/bulk`, data)
    },

    /**
     * Get attendance summary by course
     * @param {number} courseOfferingId
     * @returns {Promise}
     */
    getSummaryByCourse: (courseOfferingId) => {
        return api.get(`${API_ENDPOINTS.ATTENDANCE_RECORDS}/summary/course/${courseOfferingId}`)
    },

    /**
     * Get attendance summary by student
     * @param {number} studentId
     * @returns {Promise}
     */
    getSummaryByStudent: (studentId) => {
        return api.get(`${API_ENDPOINTS.ATTENDANCE_RECORDS}/summary/student/${studentId}`)
    },

    /**
     * Download Excel template for attendance import
     * @param {number} courseOfferingId
     * @returns {Promise<Blob>}
     */
    getTemplateExcel: async (courseOfferingId) => {
        const response = await api.get(`${API_ENDPOINTS.ATTENDANCE_RECORDS}/import/template/excel/${courseOfferingId}`, {
            responseType: 'blob'
        })
        return response
    },

    /**
     * Validate attendance import file and get preview
     * @param {number} courseOfferingId
     * @param {string} date - ISO date string (YYYY-MM-DD)
     * @param {File} file
     * @returns {Promise}
     */
    validateImport: (courseOfferingId, date, file) => {
        const formData = new FormData()
        formData.append('file', file)
        return api.post(`${API_ENDPOINTS.ATTENDANCE_RECORDS}/import/validate`, formData, {
            params: { courseOfferingId, date },
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    /**
     * Execute attendance import with conflict resolution
     * @param {Object} data - { courseOfferingId, attendanceDate, markedById, conflictResolution, rows }
     * @returns {Promise}
     */
    executeImport: (data) => {
        return api.post(`${API_ENDPOINTS.ATTENDANCE_RECORDS}/import/execute`, data)
    },
}
