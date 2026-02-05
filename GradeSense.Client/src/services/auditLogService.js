import api from './api'
import { API_ENDPOINTS } from '@/utils/constants'

const auditLogService = {
    /**
     * Get all audit logs with pagination
     * @param {Object} params - Query parameters (pageNumber, pageSize, search, userId, action, fromDate, toDate)
     * @returns {Promise<Object>} Paginated audit logs list
     */
    getAll: async (params = {}) => {
        // api.js interceptor already returns response.data, so response is the API JSON body
        return api.get(API_ENDPOINTS.AUDIT_LOGS, { params })
    },

    /**
     * Get an audit log by ID
     * @param {number} id - Audit Log ID
     * @returns {Promise<Object>} Audit log details
     */
    getById: async (id) => {
        return api.get(`${API_ENDPOINTS.AUDIT_LOGS}/${id}`)
    },

    /**
     * Get audit logs by user
     * @param {number} userId - User ID
     * @param {Object} params - Query parameters
     * @returns {Promise<Array>} User's audit logs
     */
    getByUser: async (userId, params = {}) => {
        return api.get(`${API_ENDPOINTS.AUDIT_LOGS}/user/${userId}`, { params })
    },

    /**
     * Get audit logs by entity type
     * @param {string} entityType - Entity type (User, Student, Course, etc.)
     * @param {Object} params - Query parameters
     * @returns {Promise<Array>} Audit logs for entity type
     */
    getByEntityType: async (entityType, params = {}) => {
        return api.get(`${API_ENDPOINTS.AUDIT_LOGS}/entity/${entityType}`, { params })
    },

    /**
     * Export audit logs to Excel
     * @param {Object} params - Filter parameters
     * @returns {Promise<Blob>} Excel file blob
     */
    export: async (params = {}) => {
        return api.get(`${API_ENDPOINTS.AUDIT_LOGS}/export`, {
            params,
            responseType: 'blob',
        })
    },
}

export default auditLogService
