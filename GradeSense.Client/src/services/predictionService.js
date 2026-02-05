import api from './api'
import { API_ENDPOINTS } from '@/utils/constants'

const predictionService = {
    /**
     * Get all predictions with pagination
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Paginated predictions list
     */
    getAll: async (params = {}) => {
        const response = await api.get(API_ENDPOINTS.PREDICTIONS, { params })
        return response.data
    },

    /**
     * Get a prediction by ID
     * @param {number} id - Prediction ID
     * @returns {Promise<Object>} Prediction details
     */
    getById: async (id) => {
        const response = await api.get(`${API_ENDPOINTS.PREDICTIONS}/${id}`)
        return response.data
    },

    /**
     * Get predictions for a specific student
     * @param {number} studentId - Student ID
     * @returns {Promise<Array>} Student's predictions
     */
    getByStudent: async (studentId) => {
        const response = await api.get(`${API_ENDPOINTS.PREDICTIONS}/student/${studentId}`)
        return response.data
    },

    /**
     * Get predictions for a specific course offering
     * @param {number} courseOfferingId - Course Offering ID
     * @returns {Promise<Array>} Course offering predictions
     */
    getByCourseOffering: async (courseOfferingId) => {
        const response = await api.get(`${API_ENDPOINTS.PREDICTIONS}/course-offering/${courseOfferingId}`)
        return response.data
    },

    /**
     * Generate new predictions for a course offering
     * @param {number} courseOfferingId - Course Offering ID
     * @returns {Promise<Object>} Generated predictions
     */
    generate: async (courseOfferingId) => {
        const response = await api.post(`${API_ENDPOINTS.PREDICTIONS}/generate/${courseOfferingId}`)
        return response.data
    },

    /**
     * Get at-risk students based on predictions
     * @param {Object} params - Filter parameters (courseOfferingId, riskLevel)
     * @returns {Promise<Array>} At-risk students
     */
    getAtRiskStudents: async (params = {}) => {
        const response = await api.get(`${API_ENDPOINTS.PREDICTIONS}/at-risk`, { params })
        return response.data
    },

    /**
     * Delete a prediction
     * @param {number} id - Prediction ID
     * @returns {Promise<void>}
     */
    delete: async (id) => {
        await api.delete(`${API_ENDPOINTS.PREDICTIONS}/${id}`)
    },
}

export default predictionService
