import api from './api'
import { API_ENDPOINTS } from '@/utils/constants'

export const facultyService = {
    /**
     * Get all faculties with pagination and filters
     * @param {Object} params - { pageNumber, pageSize, searchTerm, departmentId, isActive }
     * @returns {Promise}
     */
    getAll: (params = {}) => {
        // Map search to searchTerm for backend compatibility
        const { search, ...rest } = params
        const mappedParams = { ...rest }
        if (search) mappedParams.searchTerm = search
        return api.get(API_ENDPOINTS.FACULTIES, { params: mappedParams })
    },

    /**
     * Get faculty by ID
     * @param {number} id
     * @returns {Promise}
     */
    getById: (id) => {
        return api.get(`${API_ENDPOINTS.FACULTIES}/${id}`)
    },

    /**
     * Create new faculty
     * @param {Object} data
     * @returns {Promise}
     */
    create: (data) => {
        return api.post(API_ENDPOINTS.FACULTIES, data)
    },

    /**
     * Update faculty
     * @param {number} id
     * @param {Object} data
     * @returns {Promise}
     */
    update: (id, data) => {
        return api.put(`${API_ENDPOINTS.FACULTIES}/${id}`, data)
    },

    /**
     * Delete faculty (soft delete)
     * @param {number} id
     * @returns {Promise}
     */
    delete: (id) => {
        return api.delete(`${API_ENDPOINTS.FACULTIES}/${id}`)
    },

    /**
     * Get all faculties for select dropdown
     * @param {number} departmentId - Optional filter by department
     * @returns {Promise}
     */
    getAllForSelect: (departmentId = null) => {
        const params = { pageSize: 1000 }
        if (departmentId) params.departmentId = departmentId
        return api.get(API_ENDPOINTS.FACULTIES, { params })
    },

    /**
     * Get courses assigned to faculty
     * @param {number} id
     * @returns {Promise}
     */
    getCourses: (id) => {
        return api.get(`${API_ENDPOINTS.FACULTIES}/${id}/courses`)
    },

    // --- Bulk Import Methods ---

    /**
     * Download faculty import template
     * @returns {Promise<Blob>}
     */
    getImportTemplate: async () => {
        const response = await api.get(`${API_ENDPOINTS.FACULTIES}/import/template`, {
            responseType: 'blob',
        })
        return response.data
    },

    /**
     * Validate faculty import file
     * @param {File} file - Excel or CSV file
     * @returns {Promise}
     */
    validateImport: (file) => {
        const formData = new FormData()
        formData.append('file', file)
        return api.post(`${API_ENDPOINTS.FACULTIES}/import/validate`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },

    /**
     * Execute faculty import
     * @param {Object} request - { rows: [], conflictResolution: 'skip'|'update'|'error' }
     * @returns {Promise}
     */
    executeImport: (request) => {
        return api.post(`${API_ENDPOINTS.FACULTIES}/import/execute`, request)
    },
}
