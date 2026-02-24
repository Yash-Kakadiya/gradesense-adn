import api from './api'
import { API_ENDPOINTS } from '@/utils/constants'

export const assessmentItemService = {
    /**
     * Get all assessment items with pagination and filters
     * @param {Object} params - { pageNumber, pageSize, courseOfferingId, evaluationSchemeId }
     * @returns {Promise}
     */
    getAll: (params = {}) => {
        return api.get(API_ENDPOINTS.ASSESSMENT_ITEMS, { params })
    },

    /**
     * Get assessment item by ID
     * @param {number} id
     * @returns {Promise}
     */
    getById: (id) => {
        return api.get(`${API_ENDPOINTS.ASSESSMENT_ITEMS}/${id}`)
    },

    /**
     * Get assessments by course offering
     * @param {number} courseOfferingId
     * @returns {Promise}
     */
    getByCourseOffering: (courseOfferingId) => {
        return api.get(API_ENDPOINTS.ASSESSMENT_ITEMS, {
            params: { courseOfferingId, pageSize: 100 }
        })
    },

    /**
     * Get upcoming assessments for student's enrolled courses
     * @param {number[]} courseOfferingIds - Array of course offering IDs
     * @returns {Promise}
     */
    getUpcomingForStudent: async (courseOfferingIds) => {
        // Fetch assessments for all enrolled courses
        const promises = courseOfferingIds.map(id =>
            api.get(API_ENDPOINTS.ASSESSMENT_ITEMS, {
                params: { courseOfferingId: id, pageSize: 50 }
            })
        )
        const responses = await Promise.all(promises)

        // Combine and flatten results
        const allAssessments = responses.flatMap(res => res?.Data?.Data || [])

        // Sort by due date (if available) or by name
        return {
            Data: {
                Data: allAssessments.sort((a, b) => {
                    const dateA = a.DueDate ? new Date(a.DueDate) : new Date(9999, 11, 31)
                    const dateB = b.DueDate ? new Date(b.DueDate) : new Date(9999, 11, 31)
                    return dateA - dateB
                }),
                TotalRecords: allAssessments.length,
            }
        }
    },
}
