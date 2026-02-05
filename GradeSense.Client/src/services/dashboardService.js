import api from './api'

/**
 * Dashboard Service - Unified dashboard data fetching
 */
export const dashboardService = {
    /**
     * Get admin dashboard with system-wide statistics
     * @returns {Promise} Admin dashboard data
     */
    getAdminDashboard: async () => {
        return api.get('/api/dashboard/admin')
    },

    /**
     * Get student dashboard with personal academic overview
     * @param {number} studentId - Student ID
     * @returns {Promise} Student dashboard data
     */
    getStudentDashboard: async (studentId) => {
        return api.get(`/api/dashboard/student/${studentId}`)
    },

    /**
     * Get faculty dashboard with teaching overview
     * @param {number} facultyId - Faculty ID
     * @returns {Promise} Faculty dashboard data
     */
    getFacultyDashboard: async (facultyId) => {
        return api.get(`/api/dashboard/faculty/${facultyId}`)
    },

    /**
     * Get dashboard for current logged-in user (auto-detects role)
     * @returns {Promise} Dashboard data based on user role
     */
    getMyDashboard: async () => {
        return api.get('/api/dashboard/me')
    },
}

export default dashboardService
